package com.shulventures.consultancymanagement.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DuePaymentUpdateRequest(
        @NotNull
        @DecimalMin("0.00")
        BigDecimal paidAmount,

        @NotNull
        LocalDate paymentDate,

        LocalDate dueDate,

        @NotBlank
        @Size(max = 255)
        String paymentGateway,

        @NotNull
        @DecimalMin("0.00")
        BigDecimal tdsAmount,

        @NotNull
        Boolean tdsPaid
) {
}
