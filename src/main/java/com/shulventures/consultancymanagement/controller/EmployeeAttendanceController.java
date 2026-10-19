package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.attendance.AttendanceBatchRequest;
import com.shulventures.consultancymanagement.dto.employee.EmployeeListItemResponse;
import com.shulventures.consultancymanagement.service.EmployeeAttendanceService;
import com.shulventures.consultancymanagement.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class EmployeeAttendanceController {

    private final EmployeeAttendanceService attendanceService;
    private final EmployeeService employeeService;

    @GetMapping("/employees")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ATTENDANCE', 'ADD')"
    )
    public List<EmployeeListItemResponse> getActiveEmployees(
            Authentication authentication
    ) {
        return employeeService.getEmployeesForUser(authentication, "regular");
    }

    @PostMapping
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ATTENDANCE', 'ADD')"
    )
    public Map<String, Object> saveAttendance(
            @Valid @RequestBody AttendanceBatchRequest request,
            Authentication authentication
    ) {
        int savedCount = attendanceService.saveAttendance(
                request,
                authentication
        );

        return Map.of(
                "message", "Attendance recorded successfully.",
                "savedCount", savedCount
        );
    }
}