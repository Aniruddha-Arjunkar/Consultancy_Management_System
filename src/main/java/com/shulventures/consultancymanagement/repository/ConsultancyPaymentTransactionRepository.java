package com.shulventures.consultancymanagement.repository;


import com.shulventures.consultancymanagement.entity.ConsultancyPaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultancyPaymentTransactionRepository
        extends JpaRepository<ConsultancyPaymentTransaction, Long> {

    List<ConsultancyPaymentTransaction>
    findAllByOrderByPaymentDateDescIdDesc();
}