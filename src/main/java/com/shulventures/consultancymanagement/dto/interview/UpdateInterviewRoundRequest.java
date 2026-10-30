package com.shulventures.consultancymanagement.dto.interview;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record UpdateInterviewRoundRequest(
        @NotNull LocalDate interviewDate,
        @NotNull LocalTime interviewTime,
        @NotBlank String hrName,
        String remark
) {
}
