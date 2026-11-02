package com.shulventures.consultancymanagement.dto.salary;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record EmployeeAdvanceDetailResponse(
        Long employeeId,
        String employeeName,
        String month,
        BigDecimal carryForward,
        List<AdvanceRecord> advances,
        BigDecimal totalAdvanceCurrentMonth,
        BigDecimal totalAdvanceIncludingCarry,
        List<DeductionRecord> deductions,
        BigDecimal totalDeductionCurrentMonth,
        BigDecimal pending
) {
    public record AdvanceRecord(
            LocalDate date,
            BigDecimal amount,
            String remark
    ) {
    }

    public record DeductionRecord(
            String month,
            BigDecimal amount
    ) {
    }
}
