package com.shulventures.consultancymanagement.dto.employee;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeDetailResponse {

    private Long id;

    private String title;
    private String custName;
    private String motherName;
    private String custPhone;
    private String custAlternate;
    private String alternatePhoneRelation;
    private String custEmail;

    private String custAddress1;
    private String custAddress2;

    private String packageName;
    private String qualification;
    private LocalDate joiningDate;
    private String designation;

    private LocalDate dob;
    private String gender;
    private String maritalStatus;
    private String spouseName;
    private String spouseOccupation;
    private String photo;

    private String education10th;
    private String education12th;
    private String educationGraduation;
    private String educationPostgrad;

    private String experienceFresher;
    private String previousCompanyName;
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

    private String empId;
    private String previousDesignation;
    private String previousJobSalary;

    private String resignationType;
    private LocalDate resignationDate;
    private LocalDate noticePeriod;
    private LocalDate releaseDate;
    private String reasonForLeaving;
    private LocalDate abscondDate;

    private String branch;
}