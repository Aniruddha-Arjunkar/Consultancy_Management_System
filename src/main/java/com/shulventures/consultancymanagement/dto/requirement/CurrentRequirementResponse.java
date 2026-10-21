package com.shulventures.consultancymanagement.dto.requirement;
import java.time.LocalDate;
public record CurrentRequirementResponse(
        Long id,
        Long associateCompanyId,
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