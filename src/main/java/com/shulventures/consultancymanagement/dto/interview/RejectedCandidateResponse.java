package com.shulventures.consultancymanagement.dto.interview;

import java.time.LocalDate;

public record RejectedCandidateResponse(
        Long interviewId,
        String name,
        String email,
        String phone,
        LocalDate interviewDate,
        String position,
        String rejectionReason,
        String interviewStatus
) {
}
