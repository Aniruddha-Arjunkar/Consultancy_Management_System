package com.shulventures.consultancymanagement.dto.associate;

public record AssociateCompanyResponse(
        Long id,
        String companyName,
        String location,
        String workingDomain,
        String workingTechnology,
        String noOfEmployee,
        String contactPerson,
        String phone,
        String email,
        String managerName,
        String managerPhone,
        String managerEmail,
        String payPackageFresher,
        String payPackageExperienced,
        String slaAgreed,
        String payForFresher,
        String payForExperienced,
        String gstNumber,
        String shippingAddress,
        String invoiceNumber,
        String invoiceSendText,
        String slaDocument
) {}