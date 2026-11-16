package com.shulventures.consultancymanagement.dto.payment;

import java.math.BigDecimal;
import java.util.List;

public record CandidatePaymentDetailsResponse(
        String candidateStatus,
        BigDecimal totalPaidAmount,
        List<CandidatePaymentRowResponse> payments
) {
}
