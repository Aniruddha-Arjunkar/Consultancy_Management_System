package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.EmployeeAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EmployeeAttendanceRepository
        extends JpaRepository<EmployeeAttendance, Long> {

    Optional<EmployeeAttendance> findByEmployeeIdAndCurrDate(
            Long employeeId,
            LocalDate currDate
    );

    List<EmployeeAttendance> findByEmployeeIdInAndCurrDateBetween(
            Collection<Long> employeeIds,
            LocalDate startDate,
            LocalDate endDate
    );
}
