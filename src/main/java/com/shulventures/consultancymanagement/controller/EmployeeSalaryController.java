package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.salary.CreateEmployeeSalaryRequest;
import com.shulventures.consultancymanagement.dto.salary.EmployeeSalaryPreviewResponse;
import com.shulventures.consultancymanagement.dto.salary.SalaryEmployeeOptionResponse;
import com.shulventures.consultancymanagement.service.EmployeeSalaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salaries")
@RequiredArgsConstructor
public class EmployeeSalaryController {

    private final EmployeeSalaryService salaryService;

    @GetMapping("/employees")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'ADD_SALARY')"
    )
    public List<SalaryEmployeeOptionResponse> getEligibleEmployees(
            Authentication authentication
    ) {
        return salaryService.getEligibleEmployees(authentication);
    }

    @PostMapping("/preview")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'ADD_SALARY')"
    )
    public EmployeeSalaryPreviewResponse previewSalary(
            @Valid @RequestBody CreateEmployeeSalaryRequest request,
            Authentication authentication
    ) {
        return salaryService.preview(request, authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'ADD_SALARY')"
    )
    public Map<String, Object> createSalary(
            @Valid @RequestBody CreateEmployeeSalaryRequest request,
            Authentication authentication
    ) {
        EmployeeSalaryPreviewResponse savedSalary =
                salaryService.create(request, authentication);

        return Map.of(
                "message", "Salary payment recorded successfully.",
                "salary", savedSalary
        );
    }
}