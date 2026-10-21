package com.shulventures.consultancymanagement.dto.requirement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public record UpdateCurrentRequirementRequest(
        @NotNull
        Long associateCompanyId,

        @NotBlank
        String location,

        @NotBlank
        String education,

        @NotBlank
        String jobProfile,

        @NotNull
        @Positive
        Integer noOfPositions,

        @NotBlank
        String positionLevel,

        String yearsOfExperience,

        @NotBlank
        String jobDescription,

        @NotBlank
        String skillsRequired,

        @NotNull
        LocalDate openDate,

        String closeDate,

        @NotNull
        @PositiveOrZero
        Integer selectCandidate
) {
}