package com.shulventures.consultancymanagement.dto.agreement;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AgreementResponse(
        Long id,
        String name,
        String email,
        String phone,
        LocalDate dob,
        LocalDate agreementDate,
        String gender,
        String tenTh,
        BigDecimal tenThPercentage,
        String tenThYearOfPassing,
        String twelveTh,
        BigDecimal twelveThPercentage,
        String twelveThYearOfPassing,
        String graduation,
        BigDecimal graduationPercentage,
        String graduationYearOfPassing,
        String postGraduation,
        BigDecimal postGraduationPercentage,
        String postGraduationYearOfPassing,
        String address,
        String experience,
        String skills,
        String experienceDescription,
        String status,
        String shippingAddress,
        String gstNumber,
        String resume,
        String jobProfile
) {
}