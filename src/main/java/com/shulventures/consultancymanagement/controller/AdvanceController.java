package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.salary.CreateEmployeeAdvanceRequest;
import com.shulventures.consultancymanagement.dto.salary.EmployeeAdvanceResponse;
import com.shulventures.consultancymanagement.dto.salary.SalaryEmployeeOptionResponse;
import com.shulventures.consultancymanagement.service.AdvanceService;
import com.shulventures.consultancymanagement.service.EmployeeSalaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.shulventures.consultancymanagement.dto.salary.EmployeePendingAdvanceResponse;
import java.util.List;

import com.shulventures.consultancymanagement.dto.salary.EmployeeAdvanceDetailResponse;

@RestController
@RequestMapping("/api/advances")
@RequiredArgsConstructor
public class AdvanceController {

    private final AdvanceService advanceService;
    private final EmployeeSalaryService employeeSalaryService;

    @GetMapping("/employees")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'ADVANCE_ADD')"
    )
    public List<SalaryEmployeeOptionResponse> getEligibleEmployees(
            Authentication authentication
    ) {
        return employeeSalaryService.getEligibleEmployees(authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'ADVANCE_ADD')"
    )
    public EmployeeAdvanceResponse createAdvance(
            @Valid @RequestBody CreateEmployeeAdvanceRequest request,
            Authentication authentication
    ) {
        return advanceService.create(request, authentication);
    }


    @GetMapping("/pending")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'ADVANCE_VIEW')"
    )
    public List<EmployeePendingAdvanceResponse> getPendingAdvances(
            Authentication authentication
    ) {
        return advanceService.getPendingAdvances(authentication);
    }

    @GetMapping("/{employeeId}/details")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'ADVANCE_VIEW')"
    )
    public EmployeeAdvanceDetailResponse getAdvanceDetails(
            @PathVariable Long employeeId,
            @RequestParam(required = false) String month,
            Authentication authentication
    ) {
        return advanceService.getAdvanceDetails(
                employeeId,
                month,
                authentication
        );
    }
}