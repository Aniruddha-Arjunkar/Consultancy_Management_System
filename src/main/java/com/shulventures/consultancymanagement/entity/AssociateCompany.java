package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tbl_associate")
@Getter
@Setter
@NoArgsConstructor
public class AssociateCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "company_name", nullable = false, columnDefinition = "TEXT")
    private String companyName;

    @Column(name = "location", nullable = false, columnDefinition = "TEXT")
    private String location;

    @Column(name = "working_domain", nullable = false, columnDefinition = "TEXT")
    private String workingDomain;

    @Column(name = "working_technology", nullable = false, columnDefinition = "TEXT")
    private String workingTechnology;

    @Column(name = "no_of_employee", nullable = false, columnDefinition = "TEXT")
    private String noOfEmployee;

    @Column(name = "contact_person", nullable = false, columnDefinition = "TEXT")
    private String contactPerson;

    @Column(name = "phone", nullable = false, columnDefinition = "TEXT")
    private String phone;

    @Column(name = "email", nullable = false, columnDefinition = "TEXT")
    private String email;

    @Column(name = "pay_package_fresher", columnDefinition = "TEXT")
    private String payPackageFresher;

    @Column(name = "pay_package_experienced", columnDefinition = "TEXT")
    private String payPackageExperienced;

    @Column(name = "sla_agreed", nullable = false, length = 3)
    private String slaAgreed = "NO";

    @Column(name = "pay_for_fresher", columnDefinition = "TEXT")
    private String payForFresher;

    @Column(name = "pay_for_experienced", columnDefinition = "TEXT")
    private String payForExperienced;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @Column(name = "invoice_send_text", nullable = false, columnDefinition = "TEXT")
    private String invoiceSendText = "";

    @Column(name = "sla_document", nullable = false)
    private String slaDocument = "";

    @Column(name = "manager_name", length = 150)
    private String managerName;

    @Column(name = "manager_phone", length = 20)
    private String managerPhone;

    @Column(name = "manager_email", length = 150)
    private String managerEmail;
}