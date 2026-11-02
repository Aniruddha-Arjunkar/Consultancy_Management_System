package com.shulventures.consultancymanagement.dto.salary;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeAdvanceResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String paymentType,
        BigDecimal advance,
        LocalDate advanceDate,
        String remark
) {
}