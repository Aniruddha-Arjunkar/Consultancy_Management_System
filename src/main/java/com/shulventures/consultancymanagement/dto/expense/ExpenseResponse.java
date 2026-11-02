package com.shulventures.consultancymanagement.dto.expense;

import java.time.LocalDate;

public record ExpenseResponse(
        Long id,
        String expenses,
        String services,
        String amount,
        LocalDate date,
        String paymentGateway,
        String branch
) {
}
