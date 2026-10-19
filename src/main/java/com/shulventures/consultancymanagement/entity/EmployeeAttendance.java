package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(
        name = "tbl_emp_attendance",
        uniqueConstraints = @UniqueConstraint(
                name = "unique_attendance",
                columnNames = {"employee_id", "curr_date"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class EmployeeAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "curr_date")
    private LocalDate currDate;

    @Column(name = "attendance_month", length = 45)
    private String attendanceMonth;

    @Column(name = "attendance_year", length = 45)
    private String attendanceYear;

    @Column(name = "attendance", length = 45)
    private String attendance;
}
