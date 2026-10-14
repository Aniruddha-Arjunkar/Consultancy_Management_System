package com.shulventures.consultancymanagement.dto.employee;

import java.time.LocalDate;

public record EmployeeListItemResponse(
        Long id,
        String title,
        String custName,
        String custPhone,
        String custEmail,
        LocalDate joiningDate,
        String designation
) {}
