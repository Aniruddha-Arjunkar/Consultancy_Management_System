package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tbl_gst_invoice", uniqueConstraints = {
        @UniqueConstraint(name = "uk_gst_invoice_number", columnNames = "invoice_number"),
        @UniqueConstraint(name = "uk_gst_invoice_placement", columnNames = "placement_interview_id")
})
@Getter
@Setter
@NoArgsConstructor
public class GstInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number")
    private Long invoiceNumber;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "placement_interview_id")
    private Long placementInterviewId;

    @Column(name = "source_type", nullable = false, length = 20)
    private String sourceType = "Consultant";

    @Column(name = "gst_type", nullable = false, length = 20)
    private String gstType;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "cgst", nullable = false, precision = 10, scale = 2)
    private BigDecimal cgst;

    @Column(name = "sgst", nullable = false, precision = 10, scale = 2)
    private BigDecimal sgst;

    @Column(name = "igst", nullable = false, precision = 10, scale = 2)
    private BigDecimal igst;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "company_name_snapshot", nullable = false, columnDefinition = "TEXT")
    private String companyNameSnapshot;

    @Column(name = "company_gst_number_snapshot", nullable = false, length = 15)
    private String companyGstNumberSnapshot;

    @Column(name = "shipping_address_snapshot", nullable = false, columnDefinition = "TEXT")
    private String shippingAddressSnapshot;
}
