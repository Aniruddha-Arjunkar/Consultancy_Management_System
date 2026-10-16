package com.shulventures.consultancymanagement.dto.employee;

import java.time.LocalDate;

public record EmployeeResignationRequest(
        String resignationType,
        LocalDate resignationDate,
        LocalDate noticePeriod,
        LocalDate releaseDate,
        String reasonForLeaving,
        LocalDate abscondDate
) {}