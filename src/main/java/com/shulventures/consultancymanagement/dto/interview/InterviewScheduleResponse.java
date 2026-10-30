package com.shulventures.consultancymanagement.dto.interview;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record InterviewScheduleResponse(
        Long interviewId,
        Long candidateId,
        String companyName,
        String position,
        LocalDate joiningDate,
        LocalDate interviewDate,
        LocalTime interviewTime,
        String salaryPackage,
        String interviewStatus,
        String rejectionReason,
        Integer interviewRound,
        String remark,
        String hrName,
        String candidateName,
        String paymentType,
        BigDecimal companyPayAmount,
        BigDecimal candidatePayAmount,
        LocalDate companyPayDate,
        LocalDate candidatePayDate,
        BigDecimal companyGstAmount,
        BigDecimal candidateGstAmount,
        String payRemark
) {
}
