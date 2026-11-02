package com.shulventures.consultancymanagement.dto.salary;

import java.math.BigDecimal;

public record EmployeePendingAdvanceResponse(
        Long employeeId,
        String employeeName,
        BigDecimal pendingAdvance
) {
}
