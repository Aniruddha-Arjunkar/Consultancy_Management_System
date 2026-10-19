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

import com.shulventures.consultancymanagement.dto.attendance.EmployeeMonthlyAttendanceResponse;
import com.shulventures.consultancymanagement.dto.attendance.MonthlyAttendanceReportResponse;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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




    public MonthlyAttendanceReportResponse getMonthlyAttendance(
            String requestedMonth,
            Authentication authentication
    ) {
        String monthValue = requestedMonth == null || requestedMonth.isBlank()
                ? YearMonth.now(ZoneId.of("Asia/Kolkata")).toString()
                : requestedMonth.trim();

        YearMonth month;
        try {
            month = YearMonth.parse(monthValue);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException(
                    "Month must use YYYY-MM format."
            );
        }

        List<Employee> employees = employeeRepository.findAll().stream()
                .filter(employee ->
                        employee.getResignationType() == null
                                || employee.getResignationType().isBlank()
                )
                .filter(employee ->
                        branchPermissionService.hasBranchAccess(
                                authentication,
                                employee.getBranch()
                        )
                )
                .sorted(Comparator.comparing(
                        employee -> employee.getCustName() == null
                                ? ""
                                : employee.getCustName(),
                        String.CASE_INSENSITIVE_ORDER
                ))
                .toList();

        LocalDate firstDay = month.atDay(1);
        LocalDate lastDay = month.atEndOfMonth();

        List<Long> employeeIds = employees.stream()
                .map(Employee::getId)
                .toList();

        List<EmployeeAttendance> records = employeeIds.isEmpty()
                ? List.of()
                : attendanceRepository
                .findByEmployeeIdInAndCurrDateBetween(
                        employeeIds,
                        firstDay,
                        lastDay
                );

        Map<Long, Map<Integer, String>> attendanceByEmployee = new HashMap<>();

        for (EmployeeAttendance record : records) {
            attendanceByEmployee
                    .computeIfAbsent(
                            record.getEmployeeId(),
                            ignored -> new HashMap<>()
                    )
                    .put(
                            record.getCurrDate().getDayOfMonth(),
                            record.getAttendance()
                    );
        }

        List<EmployeeMonthlyAttendanceResponse> rows = employees.stream()
                .map(employee -> new EmployeeMonthlyAttendanceResponse(
                        employee.getId(),
                        employee.getCustName(),
                        employee.getBranch(),
                        attendanceByEmployee.getOrDefault(
                                employee.getId(),
                                Map.of()
                        )
                ))
                .toList();

        return new MonthlyAttendanceReportResponse(
                month.toString(),
                month.lengthOfMonth(),
                rows
        );
    }



    public EmployeeMonthlyAttendanceResponse getEmployeeMonthlyAttendance(
            Long employeeId,
            String requestedMonth,
            Authentication authentication
    ) {
        String monthValue = requestedMonth == null || requestedMonth.isBlank()
                ? YearMonth.now(ZoneId.of("Asia/Kolkata")).toString()
                : requestedMonth.trim();

        YearMonth month;
        try {
            month = YearMonth.parse(monthValue);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException(
                    "Month must use YYYY-MM format."
            );
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Employee not found."
                ));

        if (employee.getResignationType() != null
                && !employee.getResignationType().isBlank()) {
            throw new IllegalArgumentException(
                    "Attendance is available only for active employees."
            );
        }

        if (!branchPermissionService.hasBranchAccess(
                authentication,
                employee.getBranch()
        )) {
            throw new AccessDeniedException(
                    "You cannot view attendance for this employee."
            );
        }

        LocalDate firstDay = month.atDay(1);
        LocalDate lastDay = month.atEndOfMonth();

        List<EmployeeAttendance> records =
                attendanceRepository.findByEmployeeIdInAndCurrDateBetween(
                        List.of(employeeId),
                        firstDay,
                        lastDay
                );

        Map<Integer, String> attendanceByDay = new HashMap<>();

        for (EmployeeAttendance record : records) {
            attendanceByDay.put(
                    record.getCurrDate().getDayOfMonth(),
                    record.getAttendance()
            );
        }

        return new EmployeeMonthlyAttendanceResponse(
                employee.getId(),
                employee.getCustName(),
                employee.getBranch(),
                attendanceByDay
        );
    }
}