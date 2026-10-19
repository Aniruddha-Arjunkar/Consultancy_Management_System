package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.attendance.AttendanceBatchRequest;
import com.shulventures.consultancymanagement.dto.attendance.AttendanceEntryRequest;
import com.shulventures.consultancymanagement.entity.Employee;
import com.shulventures.consultancymanagement.entity.EmployeeAttendance;
import com.shulventures.consultancymanagement.repository.EmployeeAttendanceRepository;
import com.shulventures.consultancymanagement.repository.EmployeeRepository;
import com.shulventures.consultancymanagement.security.BranchPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EmployeeAttendanceService {

    private static final Set<String> ALLOWED_STATUSES =
            Set.of("P", "A", "L", "H", "HD", "WO");

    private final EmployeeAttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final BranchPermissionService branchPermissionService;

    @Transactional
    public int saveAttendance(
            AttendanceBatchRequest request,
            Authentication authentication
    ) {
        LocalDate date = request.date() != null
                ? request.date()
                : LocalDate.now(ZoneId.of("Asia/Kolkata"));

        Set<Long> seenEmployeeIds = new HashSet<>();

        for (AttendanceEntryRequest entry : request.records()) {
            if (entry.employeeId() == null) {
                throw new IllegalArgumentException("Employee is required.");
            }

            String status = entry.status() == null
                    ? ""
                    : entry.status().trim().toUpperCase(Locale.ROOT);

            if (!ALLOWED_STATUSES.contains(status)) {
                throw new IllegalArgumentException(
                        "Select a valid attendance status."
                );
            }

            if (!seenEmployeeIds.add(entry.employeeId())) {
                throw new IllegalArgumentException(
                        "Each employee can have only one attendance status."
                );
            }

            Employee employee = employeeRepository.findById(entry.employeeId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Employee not found: " + entry.employeeId()
                    ));

            if (employee.getResignationType() != null
                    && !employee.getResignationType().isBlank()) {
                throw new IllegalArgumentException(
                        "Attendance can only be added for active employees."
                );
            }

            if (!branchPermissionService.hasBranchAccess(
                    authentication,
                    employee.getBranch()
            )) {
                throw new AccessDeniedException(
                        "You cannot mark attendance for this employee."
                );
            }

            EmployeeAttendance attendance =
                    attendanceRepository
                            .findByEmployeeIdAndCurrDate(employee.getId(), date)
                            .orElseGet(EmployeeAttendance::new);

            attendance.setEmployeeId(employee.getId());
            attendance.setCurrDate(date);
            attendance.setAttendanceMonth(
                    date.getMonth().getDisplayName(
                            TextStyle.SHORT,
                            Locale.ENGLISH
                    )
            );
            attendance.setAttendanceYear(
                    String.format(Locale.ROOT, "%02d", date.getYear() % 100)
            );
            attendance.setAttendance(status);

            attendanceRepository.save(attendance);
        }

        return request.records().size();
    }
}