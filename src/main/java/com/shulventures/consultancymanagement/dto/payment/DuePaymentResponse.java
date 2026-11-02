package com.shulventures.consultancymanagement.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DuePaymentResponse(
        Long paymentId,
        String clientId,
        String branch,
        String service,
        String name,
        String phone,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal dueAmount,
        LocalDate dueDate
) {
}
