package com.shulventures.consultancymanagement.dto.gst;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateGstInvoiceRequest(
        @NotBlank
        @Pattern(regexp = "exclusive|inclusive|normal|igst")
        String gstType,
        @NotNull
        @DecimalMin("0.01")
        BigDecimal amount,
        @NotNull LocalDate invoiceDate,
        @Size(max = 2000) String comments
) {}
