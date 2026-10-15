package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.employee.CreateEmployeeRequest;
import com.shulventures.consultancymanagement.dto.employee.EmployeeDetailResponse;
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
import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaTypeFactory;
import java.nio.file.Path;

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


    @GetMapping("/{employeeId}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'VIEW')"
    )
    public EmployeeDetailResponse getEmployeeDetails(
            @PathVariable Long employeeId,
            Authentication authentication
    ) {
        return employeeService.getEmployeeDetails(
                employeeId,
                authentication
        );
    }


    @GetMapping("/{employeeId}/photo")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'VIEW')"
    )
    public ResponseEntity<Resource> getEmployeePhoto(
            @PathVariable Long employeeId,
            Authentication authentication
    ) {
        Path photoPath =
                employeeService.getEmployeePhotoPath(employeeId, authentication);

        MediaType mediaType = MediaTypeFactory
                .getMediaType(photoPath.getFileName().toString())
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(new FileSystemResource(photoPath));
    }
}
