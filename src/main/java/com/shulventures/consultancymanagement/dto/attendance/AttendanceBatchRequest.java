package com.shulventures.consultancymanagement.dto.attendance;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

public record AttendanceBatchRequest(
        LocalDate date,
        List<@Valid AttendanceEntryRequest> records
) {}
