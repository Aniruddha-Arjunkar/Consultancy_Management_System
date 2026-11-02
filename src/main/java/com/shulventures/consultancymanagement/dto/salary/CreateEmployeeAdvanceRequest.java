package com.shulventures.consultancymanagement.dto.salary;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeeAdvanceRequest(
        @NotNull Long employeeId,

        @NotNull
        @DecimalMin("0.01")
        @Digits(integer = 8, fraction = 2)
        BigDecimal advance,

        @NotNull LocalDate advanceDate,

        @Size(max = 255)
        String remark
) {
}
