package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tbl_payment")
@Getter
@Setter
@NoArgsConstructor
public class ConsultancyPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "client_Id", nullable = false, columnDefinition = "TEXT")
    private String clientId;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "due_amount", precision = 10, scale = 2)
    private BigDecimal dueAmount = BigDecimal.ZERO;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "payment_gateway", columnDefinition = "TEXT")
    private String paymentGateway;

    @Column(name = "interview_id")
    private Long interviewId;

    @Column(name = "payment_type", columnDefinition = "TEXT")
    private String paymentType;

    @Column(name = "status", length = 20)
    private String status = "active";

    @Column(name = "defaulter_note", columnDefinition = "TEXT")
    private String defaulterNote;

    @Column(name = "tds_amount", precision = 10, scale = 2)
    private BigDecimal tdsAmount = BigDecimal.ZERO;

    @Column(name = "tds_paid")
    private Boolean tdsPaid = false;
}
