package com.shulventures.consultancymanagement.dto.associate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class CreateAssociateCompanyRequest {

    @NotBlank
    private String companyName;

    @NotBlank
    private String location;

    @NotBlank
    private String workingDomain;

    @NotBlank
    private String workingTechnology;

    @NotBlank
    private String noOfEmployee;

    @NotBlank
    private String contactPerson;

    @NotBlank
    private String phone;

    @NotBlank
    @Email
    private String email;

    private String managerName;
    private String managerPhone;

    @Email
    private String managerEmail;

    @NotBlank
    private String payPackageFresher;

    @NotBlank
    private String payPackageExperienced;

    private String slaAgreed;
    private String payForFresher;
    private String payForExperienced;
    private String invoiceSendText;

    private MultipartFile slaDocument;
}