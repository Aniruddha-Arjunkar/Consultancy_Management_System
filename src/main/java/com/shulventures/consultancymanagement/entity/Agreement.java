package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tbl_agreement")
@Getter
@Setter
@NoArgsConstructor
public class Agreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "name", nullable = false, columnDefinition = "TEXT")
    private String name;

    @Column(name = "email", nullable = false, columnDefinition = "TEXT")
    private String email;

    @Column(name = "phone", nullable = false, columnDefinition = "TEXT")
    private String phone;

    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Column(name = "agreement_date")
    private LocalDate agreementDate;

    @Column(name = "gender", nullable = false, columnDefinition = "TEXT")
    private String gender;

    @Column(name = "ten_th", nullable = false, columnDefinition = "TEXT")
    private String tenTh;

    @Column(name = "ten_th_percentage", precision = 5, scale = 2)
    private BigDecimal tenThPercentage;

    @Column(name = "ten_th_year_of_passing", nullable = false, columnDefinition = "TEXT")
    private String tenThYearOfPassing;

    @Column(name = "twelve_th", nullable = false, columnDefinition = "TEXT")
    private String twelveTh;

    @Column(name = "twelve_th_percentage", precision = 5, scale = 2)
    private BigDecimal twelveThPercentage;

    @Column(name = "twelve_th_year_of_passing", nullable = false, columnDefinition = "TEXT")
    private String twelveThYearOfPassing;

    @Column(name = "graduation", nullable = false, columnDefinition = "TEXT")
    private String graduation;

    @Column(name = "graduation_percentage", precision = 5, scale = 2)
    private BigDecimal graduationPercentage;

    @Column(name = "graduation_year_of_passing", nullable = false, columnDefinition = "TEXT")
    private String graduationYearOfPassing;

    @Column(name = "post_graduation", nullable = false, columnDefinition = "TEXT")
    private String postGraduation;

    @Column(name = "post_graduation_percentage", precision = 5, scale = 2)
    private BigDecimal postGraduationPercentage;

    @Column(name = "post_graduation_year_of_passing", nullable = false, columnDefinition = "TEXT")
    private String postGraduationYearOfPassing;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "experience", nullable = false, columnDefinition = "TEXT")
    private String experience;

    @Column(name = "skills", nullable = false, columnDefinition = "TEXT")
    private String skills;

    @Column(name = "experience_description", nullable = false, columnDefinition = "TEXT")
    private String experienceDescription;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "gst_number")
    private String gstNumber;

    // Keep these when moving a student out of tbl_student_registration.
    @Column(name = "resume")
    private String resume;

    @Column(name = "job_profile")
    private String jobProfile;
}
