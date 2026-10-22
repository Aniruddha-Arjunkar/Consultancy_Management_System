package com.shulventures.consultancymanagement.dto.registration;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StudentRegistrationResponse(
        Long id,
        String name,
        String phone,
        String email,
        LocalDate dob,
        String experienceDescription,
        String gender,
        String experience,
        String address,
        String skills,
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
        String resume,
        String jobProfile
) {
}
