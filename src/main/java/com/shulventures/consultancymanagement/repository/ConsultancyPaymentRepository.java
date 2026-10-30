package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConsultancyPaymentRepository
        extends JpaRepository<ConsultancyPayment, Long> {

    Optional<ConsultancyPayment> findByInterviewIdAndPaymentType(
            Long interviewId,
            String paymentType
    );
}
