package com.shulventures.consultancymanagement.dto.agreement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record CreateAgreementRequest(
        @NotBlank
        @Pattern(regexp = "Agreed|Not Agreed")
        String status,
        LocalDate agreementDate
) {
}