package com.shulventures.consultancymanagement.dto.associate;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssociateCompanyPaymentResponse(
        Long interviewId,
        Long paymentId,
        Long candidateId,
        String candidateName,
        BigDecimal baseAmount,
        BigDecimal gstAmount,
        boolean gstEnabled,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal tdsAmount,
        Boolean tdsPaid,
        BigDecimal balanceAmount,
        LocalDate dueDate,
        String category
) {
}
