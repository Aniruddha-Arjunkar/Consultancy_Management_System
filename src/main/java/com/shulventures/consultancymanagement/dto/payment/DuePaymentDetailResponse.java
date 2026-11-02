package com.shulventures.consultancymanagement.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DuePaymentDetailResponse(
        Long paymentId,
        String clientId,
        Long interviewId,
        String paymentType,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal dueAmount,
        BigDecimal tdsAmount,
        Boolean tdsPaid,
        LocalDate paymentDate,
        LocalDate dueDate,
        String paymentGateway
) {
}
