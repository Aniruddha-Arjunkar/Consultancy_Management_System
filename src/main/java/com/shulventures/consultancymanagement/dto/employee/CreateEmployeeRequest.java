package com.shulventures.consultancymanagement.dto.employee;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Getter
@Setter
public class CreateEmployeeRequest {

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

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate joiningDate;

    private String designation;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dob;

    private String gender;
    private String maritalStatus;
    private String spouseName;
    private String spouseOccupation;
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
    private String previousDesignation;
    private String previousJobSalary;
    private String branch;

    private MultipartFile photo;
}
