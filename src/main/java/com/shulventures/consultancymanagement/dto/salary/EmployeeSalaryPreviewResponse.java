package com.shulventures.consultancymanagement.dto.salary;

import java.math.BigDecimal;

public record EmployeeSalaryPreviewResponse(
        Long employeeId,
        String employeeName,
        String month,
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
