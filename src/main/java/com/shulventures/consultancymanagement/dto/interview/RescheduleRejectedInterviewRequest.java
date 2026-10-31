package com.shulventures.consultancymanagement.dto.interview;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record RescheduleRejectedInterviewRequest(
        @NotNull
        Long requirementId,

        @NotNull
        @Min(1)
        @Max(4)
        Integer interviewRound,

        @NotNull
        LocalDate interviewDate,

        @NotNull
        LocalTime interviewTime,

        @NotBlank
        @Size(max = 255)
        String hrName,

        @NotBlank
        @Size(max = 1000)
        String remark
) {
}