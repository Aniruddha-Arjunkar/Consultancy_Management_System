package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.EmployeeSalary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeSalaryRepository extends JpaRepository<EmployeeSalary, Long> {

    List<EmployeeSalary> findByEmployeeIdOrderByMonthDesc(Long employeeId);

    List<EmployeeSalary> findByEmployeeIdAndMonth(Long employeeId, String month);

    List<EmployeeSalary> findByEmployeeId(Long employeeId);
}