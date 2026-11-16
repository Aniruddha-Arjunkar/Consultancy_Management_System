package com.shulventures.consultancymanagement.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CandidatePaymentRowResponse(
        Long paymentId,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        LocalDate paymentDate,
        String paymentGateway,
        String paymentStatus
) {
}
