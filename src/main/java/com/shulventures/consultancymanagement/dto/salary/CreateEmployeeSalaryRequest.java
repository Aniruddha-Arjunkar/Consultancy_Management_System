package com.shulventures.consultancymanagement.dto.salary;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateEmployeeSalaryRequest(

        @NotNull
        Long employeeId,

        @NotBlank
        @Pattern(
                regexp = "\\d{4}-(0[1-9]|1[0-2])",
                message = "Month must use YYYY-MM format."
        )
        String month,

        @NotBlank
        @Pattern(
                regexp = "Salary|Stipend|PerDay",
                message = "Payment type must be Salary, Stipend, or PerDay."
        )
        String paymentType,

        @DecimalMin("0.00")
        BigDecimal stipendAmount,

        @DecimalMin("0.00")
        BigDecimal performanceIncentive,

        @DecimalMin("0.00")
        BigDecimal professionTax,

        @DecimalMin("0.00")
        BigDecimal advanceDeduction,

        @DecimalMin("0.00")
        BigDecimal expenseReimbursement,

        @Size(max = 255)
        String remark
) {}
