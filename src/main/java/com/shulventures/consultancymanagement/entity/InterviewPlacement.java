package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "tbl_placement")
@Getter
@Setter
@NoArgsConstructor
public class InterviewPlacement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_id")
    private Long interviewId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "company_name", nullable = false, columnDefinition = "TEXT")
    private String companyName;

    @Column(name = "position", nullable = false, columnDefinition = "TEXT")
    private String position;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "interview_date", nullable = false)
    private LocalDate interviewDate;

    @Column(name = "interview_time", nullable = false)
    private LocalTime interviewTime;

    @Column(name = "salary_package", columnDefinition = "TEXT")
    private String salaryPackage;

    @Column(name = "interview_status", nullable = false, length = 20)
    private String interviewStatus;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "interview_round", nullable = false)
    private Integer interviewRound;

    @Column(name = "remark", nullable = false, columnDefinition = "TEXT")
    private String remark;

    @Column(name = "hr_name", nullable = false, columnDefinition = "TEXT")
    private String hrName;

    @Column(name = "candidate_name", columnDefinition = "TEXT")
    private String candidateName;

    @Column(name = "payment_type", columnDefinition = "TEXT")
    private String paymentType;

    @Column(name = "company_pay_amount", precision = 10, scale = 2)
    private BigDecimal companyPayAmount;

    @Column(name = "candidate_pay_amount", precision = 10, scale = 2)
    private BigDecimal candidatePayAmount;

    @Column(name = "company_pay_date")
    private LocalDate companyPayDate;

    @Column(name = "candidate_pay_date")
    private LocalDate candidatePayDate;

    @Column(name = "company_gst_amount", precision = 10, scale = 2)
    private BigDecimal companyGstAmount;

    @Column(name = "candidate_gst_amount", precision = 10, scale = 2)
    private BigDecimal candidateGstAmount;

    @Column(name = "pay_remark", columnDefinition = "TEXT")
    private String payRemark;
}