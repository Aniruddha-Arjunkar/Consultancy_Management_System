package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByBranchIgnoreCase(String branch);
}
