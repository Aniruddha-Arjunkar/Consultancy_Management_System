package com.shulventures.consultancymanagement.security;

import com.shulventures.consultancymanagement.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service("permissionService")
public class PermissionService {

    public boolean hasModule(Authentication authentication, String module) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            return false;
        }

        if (!(authentication.getPrincipal()
                instanceof CustomUserDetails userDetails)) {
            return false;
        }

        String role = userDetails.getUser().getRole();

        /*
         * Super Admin has access to everything.
         */
        if ("SUPER_ADMIN".equalsIgnoreCase(role)) {
            return true;
        }

        String accessModules =
                userDetails.getUser().getAccessModules();

        if (accessModules == null ||
                accessModules.isBlank()) {
            return false;
        }

        Set<String> modules = Arrays.stream(
                        accessModules.split(",")
                )
                .map(String::trim)
                .filter(moduleName -> !moduleName.isBlank())
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        /*
         * "ALL" means access to every module.
         */
        if (modules.contains("ALL")) {
            return true;
        }

        return modules.contains(module.trim().toUpperCase());
    }
}
