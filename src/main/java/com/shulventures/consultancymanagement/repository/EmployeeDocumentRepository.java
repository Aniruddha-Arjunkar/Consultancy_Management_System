package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeDocumentRepository
        extends JpaRepository<EmployeeDocument, Long> {
    List<EmployeeDocument> findByEmployeeIdOrderByIdDesc(Integer employeeId);
}