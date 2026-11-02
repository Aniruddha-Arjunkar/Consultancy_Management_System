package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.salary.CreateEmployeeAdvanceRequest;
import com.shulventures.consultancymanagement.dto.salary.EmployeeAdvanceResponse;
import com.shulventures.consultancymanagement.entity.Employee;
import com.shulventures.consultancymanagement.entity.EmployeeSalary;
import com.shulventures.consultancymanagement.repository.EmployeeRepository;
import com.shulventures.consultancymanagement.repository.EmployeeSalaryRepository;
import com.shulventures.consultancymanagement.security.BranchPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.shulventures.consultancymanagement.dto.salary.EmployeePendingAdvanceResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.shulventures.consultancymanagement.dto.salary.EmployeeAdvanceDetailResponse;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;


@Service
@RequiredArgsConstructor
public class AdvanceService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryRepository salaryRepository;
    private final BranchPermissionService branchPermissionService;

    @Transactional
    public EmployeeAdvanceResponse create(
            CreateEmployeeAdvanceRequest request,
            Authentication authentication
    ) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found.")
                );

        if (employee.getResignationType() != null
                && !employee.getResignationType().isBlank()) {
            throw new IllegalArgumentException(
                    "Advance can only be added for active employees."
            );
        }

        if (!branchPermissionService.hasBranchAccess(
                authentication,
                employee.getBranch()
        )) {
            throw new AccessDeniedException(
                    "You cannot add an advance for this employee."
            );
        }

        EmployeeSalary salaryRecord = new EmployeeSalary();
        salaryRecord.setEmployeeId(employee.getId());
        salaryRecord.setPaymentType("Advance");
        salaryRecord.setAdvance(request.advance());
        salaryRecord.setAdvanceDate(request.advanceDate());
        salaryRecord.setRemark(
                request.remark() == null || request.remark().isBlank()
                        ? null
                        : request.remark().trim()
        );

        EmployeeSalary saved = salaryRepository.save(salaryRecord);

        return new EmployeeAdvanceResponse(
                saved.getId(),
                employee.getId(),
                employee.getCustName(),
                saved.getPaymentType(),
                saved.getAdvance(),
                saved.getAdvanceDate(),
                saved.getRemark()
        );
    }


    @Transactional(readOnly = true)
    public List<EmployeePendingAdvanceResponse> getPendingAdvances(
            Authentication authentication
    ) {
        BigDecimal zero = BigDecimal.ZERO;
        Map<Long, BigDecimal[]> totalsByEmployee = new HashMap<>();

        for (EmployeeSalary record : salaryRepository.findAll()) {
            String paymentType = record.getPaymentType();

            if (!"Advance".equals(paymentType)
                    && !"Salary".equals(paymentType)
                    && !"PerDay".equals(paymentType)) {
                continue;
            }

            BigDecimal[] totals = totalsByEmployee.computeIfAbsent(
                    record.getEmployeeId(),
                    ignored -> new BigDecimal[] { zero, zero }
            );

            BigDecimal amount = record.getAdvance() == null
                    ? zero
                    : record.getAdvance();

            if ("Advance".equals(paymentType)) {
                totals[0] = totals[0].add(amount);
            } else if (amount.compareTo(zero) > 0) {
                totals[1] = totals[1].add(amount);
            }
        }

        return employeeRepository.findAll().stream()
                .filter(employee ->
                        branchPermissionService.hasBranchAccess(
                                authentication,
                                employee.getBranch()
                        )
                )
                .map(employee -> {
                    BigDecimal[] totals = totalsByEmployee.get(employee.getId());

                    if (totals == null) {
                        return null;
                    }

                    BigDecimal pending = totals[0]
                            .subtract(totals[1])
                            .setScale(2, RoundingMode.HALF_UP);

                    if (pending.compareTo(zero) <= 0) {
                        return null;
                    }

                    return new EmployeePendingAdvanceResponse(
                            employee.getId(),
                            employee.getCustName(),
                            pending
                    );
                })
                .filter(response -> response != null)
                .sorted(
                        Comparator.comparing(
                                EmployeePendingAdvanceResponse::employeeName,
                                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                        )
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public EmployeeAdvanceDetailResponse getAdvanceDetails(
            Long employeeId,
            String requestedMonth,
            Authentication authentication
    ) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found.")
                );

        if (!branchPermissionService.hasBranchAccess(
                authentication,
                employee.getBranch()
        )) {
            throw new AccessDeniedException(
                    "You cannot view advances for this employee."
            );
        }

        YearMonth selectedMonth;
        try {
            selectedMonth = requestedMonth == null || requestedMonth.isBlank()
                    ? YearMonth.now()
                    : YearMonth.parse(requestedMonth.trim());
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException(
                    "Month must use YYYY-MM format."
            );
        }

        LocalDate monthStart = selectedMonth.atDay(1);
        LocalDate monthEnd = selectedMonth.atEndOfMonth();

        BigDecimal previousAdvances = BigDecimal.ZERO;
        BigDecimal previousDeductions = BigDecimal.ZERO;
        BigDecimal currentAdvanceTotal = BigDecimal.ZERO;
        BigDecimal currentDeductionTotal = BigDecimal.ZERO;

        List<EmployeeAdvanceDetailResponse.AdvanceRecord> advances =
                new java.util.ArrayList<>();

        List<EmployeeAdvanceDetailResponse.DeductionRecord> deductions =
                new java.util.ArrayList<>();

        for (EmployeeSalary record :
                salaryRepository.findByEmployeeId(employeeId)) {

            String paymentType = record.getPaymentType();
            BigDecimal amount = record.getAdvance() == null
                    ? BigDecimal.ZERO
                    : record.getAdvance();

            if ("Advance".equals(paymentType)) {
                LocalDate advanceDate = record.getAdvanceDate();

                if (advanceDate == null) {
                    continue;
                }

                if (advanceDate.isBefore(monthStart)) {
                    previousAdvances = previousAdvances.add(amount);
                } else if (!advanceDate.isBefore(monthStart)
                        && !advanceDate.isAfter(monthEnd)) {
                    currentAdvanceTotal = currentAdvanceTotal.add(amount);
                    advances.add(
                            new EmployeeAdvanceDetailResponse.AdvanceRecord(
                                    advanceDate,
                                    amount,
                                    record.getRemark()
                            )
                    );
                }
            } else if (("Salary".equals(paymentType)
                    || "PerDay".equals(paymentType))
                    && amount.compareTo(BigDecimal.ZERO) > 0) {

                if (record.getMonth() == null || record.getMonth().isBlank()) {
                    continue;
                }

                YearMonth deductionMonth;
                try {
                    deductionMonth = YearMonth.parse(record.getMonth());
                } catch (DateTimeParseException ignored) {
                    continue;
                }

                if (deductionMonth.isBefore(selectedMonth)) {
                    previousDeductions = previousDeductions.add(amount);
                } else if (deductionMonth.equals(selectedMonth)) {
                    currentDeductionTotal =
                            currentDeductionTotal.add(amount);

                    deductions.add(
                            new EmployeeAdvanceDetailResponse.DeductionRecord(
                                    record.getMonth(),
                                    amount
                            )
                    );
                }
            }
        }

        advances.sort(
                java.util.Comparator.comparing(
                        EmployeeAdvanceDetailResponse.AdvanceRecord::date
                )
        );

        deductions.sort(
                java.util.Comparator.comparing(
                        EmployeeAdvanceDetailResponse.DeductionRecord::month
                )
        );

        BigDecimal carryForward = previousAdvances
                .subtract(previousDeductions)
                .setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal currentAdvance = currentAdvanceTotal
                .setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal currentDeduction = currentDeductionTotal
                .setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal totalIncludingCarry = carryForward
                .add(currentAdvance)
                .setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal pending = totalIncludingCarry
                .subtract(currentDeduction)
                .setScale(2, java.math.RoundingMode.HALF_UP);

        return new EmployeeAdvanceDetailResponse(
                employee.getId(),
                employee.getCustName(),
                selectedMonth.toString(),
                carryForward,
                advances,
                currentAdvance,
                totalIncludingCarry,
                deductions,
                currentDeduction,
                pending
        );
    }
}
