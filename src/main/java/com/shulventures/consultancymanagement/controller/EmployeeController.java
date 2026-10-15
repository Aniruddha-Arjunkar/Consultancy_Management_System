package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.employee.CreateEmployeeRequest;
import com.shulventures.consultancymanagement.entity.Employee;
import com.shulventures.consultancymanagement.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.shulventures.consultancymanagement.dto.employee.EmployeeListItemResponse;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'ADD')"
    )
    public ResponseEntity<Map<String, Object>> createEmployee(
            @ModelAttribute CreateEmployeeRequest request,
            Authentication authentication
    ) {
        Employee employee = employeeService.create(request, authentication);

        Map<String, Object> response = Map.of(
                "id", employee.getId(),
                "empId", employee.getEmpId(),
                "name", employee.getCustName(),
                "branch", employee.getBranch()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @GetMapping
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'VIEW')"
    )
    public List<EmployeeListItemResponse> getEmployees(
            @RequestParam(defaultValue = "regular") String status,
            Authentication authentication
    ) {
        return employeeService.getEmployeesForUser(authentication, status);
    }
}
