package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "tbl_expenses")
@Getter
@Setter
@NoArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(name = "expenses", nullable = false, length = 255)
    private String expenses;

    @Column(name = "services", nullable = false, length = 255)
    private String services;

    // The Seniors schema stores amount as TEXT.
    @Column(name = "amount", nullable = false, columnDefinition = "TEXT")
    private String amount;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "payment_gateway", nullable = false, length = 255)
    private String paymentGateway;

    @Column(name = "branch", nullable = false, length = 255)
    private String branch;
}