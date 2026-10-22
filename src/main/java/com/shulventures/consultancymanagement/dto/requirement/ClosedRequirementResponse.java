package com.shulventures.consultancymanagement.dto.requirement;

import java.time.LocalDate;

public record ClosedRequirementResponse(
        Long id,
        String companyName,
        String location,
        String education,
        String jobProfile,
        Integer noOfPositions,
        String positionLevel,
        String yearsOfExperience,
        String jobDescription,
        String skillsRequired,
        LocalDate openDate,
        String closeDate,
        Integer selectCandidate
) {
}