package com.shulventures.consultancymanagement.dto.payment;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentHistoryResponse(
        Long paymentId,
        String branch,
        String service,
        String name,
        BigDecimal paidAmount,
        LocalDate paymentDate,
        String paymentGateway
) {
}
