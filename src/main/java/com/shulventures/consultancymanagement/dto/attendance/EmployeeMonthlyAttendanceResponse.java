package com.shulventures.consultancymanagement.dto.attendance;

import java.util.Map;

public record EmployeeMonthlyAttendanceResponse(
        Long employeeId,
        String employeeName,
        String branch,
        Map<Integer, String> attendanceByDay
) {}
