package com.shulventures.consultancymanagement.security;

import com.shulventures.consultancymanagement.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("branchPermissionService")
public class BranchPermissionService {

    /**
     * Checks whether the logged-in user can access the requested branch.
     */
    public boolean hasBranchAccess(Authentication authentication, String requestedBranch) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return false;
        }

        if (!(authentication.getPrincipal()
                instanceof CustomUserDetails userDetails)) {

            return false;
        }

        String userRole = userDetails.getUser().getRole();

        String userBranch = userDetails.getUser().getBranch();

        /*
         * Super Admin can access every branch.
         */
        if ("SUPER_ADMIN".equalsIgnoreCase(userRole)) {
            return true;
        }

        /*
         * A user without a branch has no branch access.
         */
        if (userBranch == null ||
                userBranch.isBlank()) {

            return false;
        }

        /*
         * User assigned to ALL can access every branch.
         */
        if ("ALL".equalsIgnoreCase(userBranch)) {
            return true;
        }

        /*
         * If no specific branch was requested,
         * the user's own branch is allowed.
         */
        if (requestedBranch == null ||
                requestedBranch.isBlank()) {

            return true;
        }

        return userBranch.trim().equalsIgnoreCase(requestedBranch.trim());
    }
}
