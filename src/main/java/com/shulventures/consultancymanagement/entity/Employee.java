package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "tbl_employee")
@Getter
@Setter
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    private String title;
    private String custName;
    private String motherName;
    private String custPhone;
    private String custAlternate;
    private String alternatePhoneRelation;
    private String custEmail;

    @Column(columnDefinition = "TEXT")
    private String custAddress1;

    @Column(columnDefinition = "TEXT")
    private String custAddress2;

    @Column(name = "package")
    private String packageName;

    private String qualification;

    @Column(name = "date")
    private LocalDate joiningDate;

    private String designation;
    private LocalDate dob;
    private String gender;
    private String maritalStatus;
    private String spouseName;
    private String spouseOccupation;
    private String photo;

    @Column(columnDefinition = "TEXT")
    private String education10th;

    @Column(columnDefinition = "TEXT")
    private String education12th;

    @Column(columnDefinition = "TEXT")
    private String educationGraduation;

    @Column(columnDefinition = "TEXT")
    private String educationPostgrad;

    private String experienceFresher;

    @Column(columnDefinition = "TEXT")
    private String previousCompanyName;

    @Column(columnDefinition = "TEXT")
    private String previousExperience;

    private String workExperienceYears;
    private String adharNo;
    private String panCardNo;
    private String accountNo;
    private String bankName;
    private String branchName;
    private String ifscCode;
    private String employeeType;
    private String department;
    private String pfUan;
    private String pfNumber;
    private String esicNumber;

    @Column(unique = true)
    private String empId;

    private String previousDesignation;
    private String previousJobSalary;
    private String resignationType;
    private LocalDate resignationDate;
    private LocalDate noticePeriod;
    private LocalDate releaseDate;

    @Column(columnDefinition = "TEXT")
    private String reasonForLeaving;

    private LocalDate abscondDate;
    private String branch;
}