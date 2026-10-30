package com.shulventures.consultancymanagement.dto.interview;
import java.time.LocalDate;

public record PlacedCandidateResponse(
        Long interviewId,
        String name,
        String phone,
        String email,
        String companyName,
        String position,
        LocalDate joiningDate,
        String salaryPackage,
        String status
) {
}
