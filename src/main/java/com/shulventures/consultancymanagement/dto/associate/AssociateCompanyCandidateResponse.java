package com.shulventures.consultancymanagement.dto.associate;

import java.time.LocalDate;
import java.time.LocalTime;

public record AssociateCompanyCandidateResponse(
        Long interviewId,
        Long candidateId,
        String candidateName,
        LocalDate interviewDate,
        String position,
        LocalTime interviewTime,
        String interviewStatus,
        String remark,
        String salaryPackage,
        LocalDate joiningDate,
        String hrName,
        String rejectionReason
) {
}