package com.shulventures.consultancymanagement.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DefaulterPaymentResponse(
        Long paymentId,
        String clientId,
        String name,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal dueAmount,
        LocalDate dueDate,
        String defaulterNote
) {
}
