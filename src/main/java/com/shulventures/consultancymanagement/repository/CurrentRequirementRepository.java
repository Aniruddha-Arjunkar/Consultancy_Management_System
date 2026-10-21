package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.CurrentRequirement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CurrentRequirementRepository extends JpaRepository<CurrentRequirement, Long> {
    List<CurrentRequirement> findAllByOrderByOpenDateDesc();
    List<CurrentRequirement> findAllByOrderByIdDesc();
}
