package com.shulventures.consultancymanagement.dto.registration;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CreateStudentRegistrationRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    @NotBlank
    @Email
    private String email;

    @NotNull
    private LocalDate dob;

    private String experienceDescription;

    @NotBlank
    private String gender;

    @NotBlank
    private String experience;

    private String address;

    private String skills;

    private String tenTh;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal tenThPercentage;

    private String tenThYearOfPassing;

    private String twelveTh;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal twelveThPercentage;

    private String twelveThYearOfPassing;

    private String graduation;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal graduationPercentage;

    private String graduationYearOfPassing;

    private String postGraduation;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal postGraduationPercentage;

    private String postGraduationYearOfPassing;

    @NotNull
    private MultipartFile resume;

    @NotNull
    private Long requirementId;
}
