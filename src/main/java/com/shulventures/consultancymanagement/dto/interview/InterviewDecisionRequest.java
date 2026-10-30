package com.shulventures.consultancymanagement.dto.interview;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record InterviewDecisionRequest(
        @Pattern(regexp = "Placed|Rejected")
        String status,

        @Size(max = 1000)
        String rejectionReason
) {
}
