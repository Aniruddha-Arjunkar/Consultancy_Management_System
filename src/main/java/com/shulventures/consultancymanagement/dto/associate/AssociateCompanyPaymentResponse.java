package com.shulventures.consultancymanagement.dto.associate;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssociateCompanyPaymentResponse(
        Long interviewId,
        Long candidateId,
        String candidateName,
        BigDecimal baseAmount,
        BigDecimal gstAmount,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal tdsAmount,
        Boolean tdsPaid,
        BigDecimal balanceAmount,
        LocalDate dueDate,
        String category
) {
}
