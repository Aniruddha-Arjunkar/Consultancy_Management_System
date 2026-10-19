package com.shulventures.consultancymanagement.dto.salary;

import java.math.BigDecimal;

public record SalaryEmployeeOptionResponse(
        Long employeeId,
        String employeeName,
        String employeeType,
        BigDecimal packageAmount,
        String branch
) {}
