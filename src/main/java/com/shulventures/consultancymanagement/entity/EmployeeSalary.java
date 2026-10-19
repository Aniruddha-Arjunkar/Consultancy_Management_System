package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tbl_salary")
@Getter
@Setter
@NoArgsConstructor
public class EmployeeSalary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    // Store as YYYY-MM, matching the Senior month input.
    @Column(name = "month", length = 7)
    private String month;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "basic", precision = 10, scale = 2)
    private BigDecimal basic;

    @Column(name = "hra", precision = 10, scale = 2)
    private BigDecimal hra;

    @Column(name = "conveyance", precision = 10, scale = 2)
    private BigDecimal conveyance;

    @Column(name = "food_allowance", precision = 10, scale = 2)
    private BigDecimal foodAllowance;

    @Column(name = "performance_incentive", precision = 10, scale = 2)
    private BigDecimal performanceIncentive;

    @Column(name = "profession_tax", precision = 10, scale = 2)
    private BigDecimal professionTax;

    // For Advance records, this is the amount given.
    // For Salary/PerDay records, this is the advance deduction.
    @Column(name = "advance", precision = 10, scale = 2)
    private BigDecimal advance;

    // Keep Senior values: Salary, Stipend, Advance, PerDay.
    @Column(name = "payment_type", length = 20, nullable = false)
    private String paymentType;

    @Column(name = "advance_date")
    private LocalDate advanceDate;

    @Column(name = "remark", length = 255)
    private String remark;

    @Column(name = "expense_reimbursement", precision = 10, scale = 2)
    private BigDecimal expenseReimbursement;
}