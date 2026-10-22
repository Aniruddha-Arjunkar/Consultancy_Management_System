package com.shulventures.consultancymanagement.dto.registration;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class UpdateStudentRegistrationRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    @NotBlank
    @Email
    private String email;

    @NotNull
    private LocalDate dob;

    @NotBlank
    private String gender;

    private String address;

    private String tenThYearOfPassing;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal tenThPercentage;

    private String twelveThYearOfPassing;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal twelveThPercentage;

    private String graduation;

    private String graduationYearOfPassing;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal graduationPercentage;

    private String postGraduation;

    private String postGraduationYearOfPassing;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal postGraduationPercentage;

    @NotBlank
    private String experience;

    private String experienceDescription;

    private String skills;
}