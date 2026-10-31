package com.shulventures.consultancymanagement.dto.agreement;
import java.time.LocalDate;

public record CandidateInterviewDetailResponse(
        Long interviewId,
        String companyName,
        String position,
        LocalDate interviewDate,
        Integer interviewRound,
        String remark,
        String interviewStatus
) {
}
