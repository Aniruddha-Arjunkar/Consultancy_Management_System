package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.Agreement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgreementRepository extends JpaRepository<Agreement, Long> {
}
