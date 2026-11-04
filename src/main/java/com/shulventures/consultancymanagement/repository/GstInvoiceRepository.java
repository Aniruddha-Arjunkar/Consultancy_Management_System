package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.GstInvoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GstInvoiceRepository extends JpaRepository<GstInvoice, Long> {
    boolean existsByPlacementInterviewId(Long placementInterviewId);
}
