package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.AssociateCompany;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssociateCompanyRepository
        extends JpaRepository<AssociateCompany, Long> {
    List<AssociateCompany> findAllByOrderByIdDesc();
}