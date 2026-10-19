package com.shulventures.consultancymanagement.dto.attendance;

import jakarta.validation.constraints.NotNull;

public record AttendanceEntryRequest(
        @NotNull Long employeeId,
        @NotNull String status
) {}