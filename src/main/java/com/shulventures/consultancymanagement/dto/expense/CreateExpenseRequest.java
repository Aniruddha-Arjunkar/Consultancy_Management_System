package com.shulventures.consultancymanagement.dto.expense;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateExpenseRequest(
        @NotBlank
        @Size(max = 255)
        String expenses,

        @NotBlank
        @Size(max = 255)
        String services,

        @NotNull
        @DecimalMin("0.01")
        @Digits(integer = 15, fraction = 2)
        BigDecimal amount,

        @NotNull
        LocalDate date,

        @NotBlank
        @Pattern(regexp = "Cash|UPI|NEFT|Cheque|IMPS|Other")
        String paymentGateway,

        @NotBlank
        @Pattern(regexp = "Nagpur|Bramhapuri|Chandrapur")
        String branch
) {
}
