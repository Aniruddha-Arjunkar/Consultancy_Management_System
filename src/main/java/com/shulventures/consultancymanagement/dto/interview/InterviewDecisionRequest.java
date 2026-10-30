package com.shulventures.consultancymanagement.dto.interview;

import jakarta.validation.constraints.Pattern;

public record InterviewDecisionRequest(
        @Pattern(regexp = "Placed|Rejected")
        String status
) {
}
