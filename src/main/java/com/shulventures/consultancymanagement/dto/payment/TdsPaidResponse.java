package com.shulventures.consultancymanagement.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TdsPaidResponse(
        Long paymentId,
        String name,
        BigDecimal tdsAmount,
        LocalDate paymentDate
) {
}
