package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.ClosedRequirement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClosedRequirementRepository
        extends JpaRepository<ClosedRequirement, Long> {

    List<ClosedRequirement> findAllByOrderByIdDesc();
}
