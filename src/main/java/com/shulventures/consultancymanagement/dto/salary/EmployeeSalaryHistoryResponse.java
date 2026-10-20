package com.shulventures.consultancymanagement.dto.salary;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record EmployeeSalaryHistoryResponse(
        Long employeeId,
        String employeeName,
        String employeeType,
        BigDecimal packageAmount,
        String month,
        BigDecimal attendanceDays,
        List<SalaryRecord> records
) {
    public record SalaryRecord(
            Long id,
            String paymentType,
            BigDecimal amount,
            BigDecimal basic,
            BigDecimal hra,
            BigDecimal conveyance,
            BigDecimal foodAllowance,
            BigDecimal performanceIncentive,
            BigDecimal expenseReimbursement,
            BigDecimal professionTax,
            BigDecimal advance,
            LocalDate advanceDate
    ) {}
}