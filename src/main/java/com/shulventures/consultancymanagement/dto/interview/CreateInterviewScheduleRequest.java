package com.shulventures.consultancymanagement.dto.interview;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreateInterviewScheduleRequest(
        @NotNull Long candidateId,
        @NotNull Long requirementId,
        @NotNull LocalDate interviewDate,
        @NotNull LocalTime interviewTime,
        @NotNull @Min(1) @Max(4) Integer interviewRound,
        @NotBlank String hrName,
        String remark
) {
}