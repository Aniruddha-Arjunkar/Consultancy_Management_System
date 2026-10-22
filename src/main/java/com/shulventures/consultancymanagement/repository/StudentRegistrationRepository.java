package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.StudentRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRegistrationRepository extends JpaRepository<StudentRegistration, Long> {
    List<StudentRegistration> findAllByOrderByIdDesc();
}