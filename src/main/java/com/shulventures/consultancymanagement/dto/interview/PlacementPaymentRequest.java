package com.shulventures.consultancymanagement.dto.interview;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PlacementPaymentRequest(
        @NotBlank
        @Size(max = 255)
        String salaryPackage,

        @NotNull
        LocalDate joiningDate,

        @NotBlank
        @Pattern(regexp = "Company Pay|Candidate Pay|Both Pay")
        String paymentType,

        @DecimalMin("0.00")
        BigDecimal companyPayAmount,

        LocalDate companyPayDate,

        boolean companyGstApplicable,

        @DecimalMin("0.00")
        BigDecimal candidatePayAmount,

        LocalDate candidatePayDate,

        boolean candidateGstApplicable,

        @Size(max = 255)
        String payRemark
) {}
