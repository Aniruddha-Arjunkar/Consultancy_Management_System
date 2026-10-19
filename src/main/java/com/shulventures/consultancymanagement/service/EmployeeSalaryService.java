package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.salary.CreateEmployeeSalaryRequest;
import com.shulventures.consultancymanagement.dto.salary.EmployeeSalaryPreviewResponse;
import com.shulventures.consultancymanagement.entity.Employee;
import com.shulventures.consultancymanagement.entity.EmployeeAttendance;
import com.shulventures.consultancymanagement.entity.EmployeeSalary;
import com.shulventures.consultancymanagement.repository.EmployeeAttendanceRepository;
import com.shulventures.consultancymanagement.repository.EmployeeRepository;
import com.shulventures.consultancymanagement.repository.EmployeeSalaryRepository;
import com.shulventures.consultancymanagement.security.BranchPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

import com.shulventures.consultancymanagement.dto.salary.SalaryEmployeeOptionResponse;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class EmployeeSalaryService {

    private static final BigDecimal ZERO = new BigDecimal("0.00");
    private static final BigDecimal ONE = BigDecimal.ONE;
    private static final BigDecimal HALF = new BigDecimal("0.5");

    private final EmployeeSalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeAttendanceRepository attendanceRepository;
    private final BranchPermissionService branchPermissionService;

    @Transactional(readOnly = true)
    public EmployeeSalaryPreviewResponse preview(
            CreateEmployeeSalaryRequest request,
            Authentication authentication
    ) {
        Calculation calculation = calculate(request, authentication);
        return toResponse(calculation);
    }

    @Transactional
    public EmployeeSalaryPreviewResponse create(
            CreateEmployeeSalaryRequest request,
            Authentication authentication
    ) {
        Calculation calculation = calculate(request, authentication);

        EmployeeSalary salary = new EmployeeSalary();
        salary.setEmployeeId(calculation.employee().getId());
        salary.setMonth(calculation.month().toString());
        salary.setPaymentType(calculation.paymentType());
        salary.setAmount(calculation.netPayable());
        salary.setBasic(calculation.basic());
        salary.setHra(calculation.hra());
        salary.setConveyance(calculation.conveyance());
        salary.setFoodAllowance(calculation.foodAllowance());
        salary.setPerformanceIncentive(
                calculation.performanceIncentive()
        );
        salary.setProfessionTax(calculation.professionTax());
        salary.setAdvance(calculation.advanceDeduction());
        salary.setExpenseReimbursement(
                calculation.expenseReimbursement()
        );
        salary.setRemark(
                request.remark() == null || request.remark().isBlank()
                        ? null
                        : request.remark().trim()
        );

        salaryRepository.save(salary);

        return toResponse(calculation);
    }

    private Calculation calculate(
            CreateEmployeeSalaryRequest request,
            Authentication authentication
    ) {
        YearMonth month = parseMonth(request.month());

        String paymentType = request.paymentType() == null
                ? ""
                : request.paymentType().trim();

        if (!List.of("Salary", "Stipend", "PerDay").contains(paymentType)) {
            throw new IllegalArgumentException("Invalid payment type.");
        }

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found.")
                );

        if (employee.getResignationType() != null
                && !employee.getResignationType().isBlank()) {
            throw new IllegalArgumentException(
                    "Salary can only be added for active employees."
            );
        }

        if (!branchPermissionService.hasBranchAccess(
                authentication,
                employee.getBranch()
        )) {
            throw new AccessDeniedException(
                    "You cannot add salary for this employee."
            );
        }

        BigDecimal packageAmount = parsePackage(employee.getPackageName());

        BigDecimal paidDays = paymentType.equals("PerDay")
                ? getPaidDays(employee.getId(), month)
                : ZERO;

        BigDecimal ratePerDay = ZERO;
        BigDecimal grossAmount;

        switch (paymentType) {
            case "Salary" -> grossAmount = packageAmount;

            case "Stipend" -> {
                BigDecimal stipendAmount = request.stipendAmount() == null
                        ? packageAmount
                        : nonNegative(
                        request.stipendAmount(),
                        "Stipend amount"
                );

                grossAmount = stipendAmount;
            }

            case "PerDay" -> {
                if ("Per Day".equalsIgnoreCase(employee.getEmployeeType())) {
                    ratePerDay = packageAmount;
                } else {
                    ratePerDay = packageAmount.divide(
                            BigDecimal.valueOf(month.lengthOfMonth()),
                            2,
                            RoundingMode.HALF_UP
                    );
                }

                grossAmount = ratePerDay
                        .multiply(paidDays)
                        .setScale(2, RoundingMode.HALF_UP);
            }

            default -> throw new IllegalArgumentException(
                    "Invalid payment type."
            );
        }

        BigDecimal basic = ZERO;
        BigDecimal hra = ZERO;
        BigDecimal conveyance = ZERO;
        BigDecimal foodAllowance = ZERO;
        BigDecimal performanceIncentive = ZERO;
        BigDecimal professionTax = ZERO;
        BigDecimal expenseReimbursement = ZERO;
        BigDecimal pendingAdvance = getPendingAdvance(employee.getId());
        BigDecimal advanceDeduction = ZERO;

        if (paymentType.equals("Salary")) {
            // Salary breakup: Basic 50%, HRA 20%, Conveyance 10%, Food 20%.
            basic = percentage(grossAmount, 50);
            hra = percentage(grossAmount, 20);
            conveyance = percentage(grossAmount, 10);
            foodAllowance = percentage(grossAmount, 20);
        }

        if (paymentType.equals("Salary") || paymentType.equals("PerDay")) {
            performanceIncentive = nonNegative(
                    request.performanceIncentive(),
                    "Performance incentive"
            );

            professionTax = nonNegative(
                    request.professionTax(),
                    "Profession tax"
            );

            expenseReimbursement = nonNegative(
                    request.expenseReimbursement(),
                    "Expense reimbursement"
            );

            BigDecimal requestedDeduction = nonNegative(
                    request.advanceDeduction(),
                    "Advance deduction"
            );

            // Match Senior behavior: do not deduct more than the pending balance.
            advanceDeduction = requestedDeduction.min(pendingAdvance);
        }

        BigDecimal netPayable = grossAmount
                .add(performanceIncentive)
                .add(expenseReimbursement)
                .subtract(professionTax)
                .subtract(advanceDeduction)
                .setScale(2, RoundingMode.HALF_UP);

        if (netPayable.compareTo(ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Deductions cannot exceed the payable amount."
            );
        }

        return new Calculation(
                employee,
                month,
                paymentType,
                packageAmount,
                paidDays,
                ratePerDay,
                grossAmount,
                basic,
                hra,
                conveyance,
                foodAllowance,
                performanceIncentive,
                professionTax,
                pendingAdvance,
                advanceDeduction,
                expenseReimbursement,
                netPayable
        );
    }

    private BigDecimal getPaidDays(Long employeeId, YearMonth month) {
        List<EmployeeAttendance> records =
                attendanceRepository.findByEmployeeIdInAndCurrDateBetween(
                        List.of(employeeId),
                        month.atDay(1),
                        month.atEndOfMonth()
                );

        BigDecimal paidDays = ZERO;

        for (EmployeeAttendance record : records) {
            String status = record.getAttendance() == null
                    ? ""
                    : record.getAttendance().trim().toUpperCase(Locale.ROOT);

            if (status.equals("P")) {
                paidDays = paidDays.add(ONE);
            } else if (status.equals("HD")) {
                paidDays = paidDays.add(HALF);
            }
        }

        return paidDays.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal getPendingAdvance(Long employeeId) {
        BigDecimal advancesGiven = ZERO;
        BigDecimal advancesDeducted = ZERO;

        for (EmployeeSalary record :
                salaryRepository.findByEmployeeId(employeeId)) {

            BigDecimal advance = record.getAdvance() == null
                    ? ZERO
                    : record.getAdvance();

            if ("Advance".equals(record.getPaymentType())) {
                advancesGiven = advancesGiven.add(advance);
            } else if ("Salary".equals(record.getPaymentType())
                    || "PerDay".equals(record.getPaymentType())) {
                advancesDeducted = advancesDeducted.add(advance);
            }
        }

        return advancesGiven.subtract(advancesDeducted)
                .max(ZERO)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal percentage(BigDecimal amount, int percent) {
        return amount
                .multiply(BigDecimal.valueOf(percent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal parsePackage(String packageValue) {
        if (packageValue == null || packageValue.isBlank()) {
            return ZERO;
        }

        try {
            BigDecimal amount = new BigDecimal(packageValue.trim());

            if (amount.compareTo(ZERO) < 0) {
                throw new IllegalArgumentException(
                        "Employee package cannot be negative."
                );
            }

            return amount.setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(
                    "Employee package must be a valid number."
            );
        }
    }

    private BigDecimal nonNegative(BigDecimal value, String fieldName) {
        if (value == null) {
            return ZERO;
        }

        if (value.compareTo(ZERO) < 0) {
            throw new IllegalArgumentException(
                    fieldName + " cannot be negative."
            );
        }

        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private YearMonth parseMonth(String monthValue) {
        try {
            return YearMonth.parse(monthValue);
        } catch (DateTimeParseException | NullPointerException exception) {
            throw new IllegalArgumentException(
                    "Month must use YYYY-MM format."
            );
        }
    }

    private EmployeeSalaryPreviewResponse toResponse(
            Calculation calculation
    ) {
        return new EmployeeSalaryPreviewResponse(
                calculation.employee().getId(),
                calculation.employee().getCustName(),
                calculation.month().toString(),
                calculation.paymentType(),
                calculation.packageAmount(),
                calculation.paidDays(),
                calculation.ratePerDay(),
                calculation.grossAmount(),
                calculation.basic(),
                calculation.hra(),
                calculation.conveyance(),
                calculation.foodAllowance(),
                calculation.performanceIncentive(),
                calculation.professionTax(),
                calculation.pendingAdvance(),
                calculation.advanceDeduction(),
                calculation.expenseReimbursement(),
                calculation.netPayable()
        );
    }

    private record Calculation(
            Employee employee,
            YearMonth month,
            String paymentType,
            BigDecimal packageAmount,
            BigDecimal paidDays,
            BigDecimal ratePerDay,
            BigDecimal grossAmount,
            BigDecimal basic,
            BigDecimal hra,
            BigDecimal conveyance,
            BigDecimal foodAllowance,
            BigDecimal performanceIncentive,
            BigDecimal professionTax,
            BigDecimal pendingAdvance,
            BigDecimal advanceDeduction,
            BigDecimal expenseReimbursement,
            BigDecimal netPayable
    ) {}


    @Transactional(readOnly = true)
    public List<SalaryEmployeeOptionResponse> getEligibleEmployees(
            Authentication authentication
    ) {
        return employeeRepository.findAll().stream()
                .filter(employee ->
                        employee.getResignationType() == null
                                || employee.getResignationType().isBlank()
                )
                .filter(employee ->
                        branchPermissionService.hasBranchAccess(
                                authentication,
                                employee.getBranch()
                        )
                )
                .sorted(Comparator.comparing(
                        Employee::getCustName,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                ))
                .map(employee -> new SalaryEmployeeOptionResponse(
                        employee.getId(),
                        employee.getCustName(),
                        employee.getEmployeeType(),
                        parsePackage(employee.getPackageName()),
                        employee.getBranch()
                ))
                .toList();
    }
}
