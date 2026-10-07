package com.shulventures.consultancymanagement.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/test/permissions")
public class PermissionTestController {

    @GetMapping("/employee")
    @PreAuthorize("@permissionService.hasModule(authentication, 'EMPLOYEE')")
    public String employeePermission() {
        return "EMPLOYEE module access granted";
    }

    @GetMapping("/attendance")
    @PreAuthorize("@permissionService.hasModule(authentication, 'ATTENDANCE')")
    public String attendancePermission() {
        return "ATTENDANCE module access granted";
    }

    @GetMapping("/accounts")
    @PreAuthorize("@permissionService.hasModule(authentication, 'ACCOUNTS')")
    public String accountsPermission() {
        return "ACCOUNTS module access granted";
    }

    @GetMapping("/consultancy")
    @PreAuthorize("@permissionService.hasModule(authentication, 'CONSULTANCY')")
    public String consultancyPermission() {
        return "CONSULTANCY module access granted";
    }

    @GetMapping("/branch")
    @PreAuthorize("@branchPermissionService.hasBranchAccess(authentication, #branch)")
    public String branchPermission(
            @RequestParam String branch
    ) {
        return "Branch access granted for: " + branch;
    }


}
