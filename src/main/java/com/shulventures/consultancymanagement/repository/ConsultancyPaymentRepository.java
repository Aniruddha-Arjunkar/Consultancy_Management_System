package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConsultancyPaymentRepository
        extends JpaRepository<ConsultancyPayment, Long> {

    Optional<ConsultancyPayment> findByInterviewIdAndPaymentType(
            Long interviewId,
            String paymentType
    );

    List<ConsultancyPayment> findByStatusNotOrderByDueDateAscIdAsc(
            String status
    );

    List<ConsultancyPayment> findByClientId(String clientId);

    List<ConsultancyPayment> findByStatusOrderByDueDateAscIdAsc(String status);
}
