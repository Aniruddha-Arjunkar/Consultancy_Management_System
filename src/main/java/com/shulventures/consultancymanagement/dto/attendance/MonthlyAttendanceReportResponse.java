package com.shulventures.consultancymanagement.dto.attendance;

import java.util.List;

public record MonthlyAttendanceReportResponse(
        String month,
        int daysInMonth,
        List<EmployeeMonthlyAttendanceResponse> employees
) {}