package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.requirement.AssociateCompanyOptionResponse;
import com.shulventures.consultancymanagement.dto.requirement.CreateCurrentRequirementRequest;
import com.shulventures.consultancymanagement.dto.requirement.CurrentRequirementResponse;
import com.shulventures.consultancymanagement.dto.requirement.UpdateCurrentRequirementRequest;
import com.shulventures.consultancymanagement.service.CurrentRequirementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirements")
@RequiredArgsConstructor
public class CurrentRequirementController {

    private final CurrentRequirementService requirementService;

    @GetMapping("/associate-companies")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'REQUIREMENT_ADD')"
    )
    public List<AssociateCompanyOptionResponse> getAssociateCompanyOptions() {
        return requirementService.getAssociateCompanyOptions();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'REQUIREMENT_ADD')"
    )
    public CurrentRequirementResponse createRequirement(
            @Valid @RequestBody CreateCurrentRequirementRequest request
    ) {
        return requirementService.create(request);
    }

    @GetMapping
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'REQUIREMENT_VIEW')"
    )
    public List<CurrentRequirementResponse> getRequirements() {
        return requirementService.getAll();
    }


    @GetMapping("/{id}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'REQUIREMENT_VIEW')"
    )
    public CurrentRequirementResponse getRequirement(@PathVariable Long id) {
        return requirementService.getById(id);
    }


    @PutMapping("/{id}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'REQUIREMENT_VIEW')"
    )
    public CurrentRequirementResponse updateRequirement(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCurrentRequirementRequest request
    ) {
        return requirementService.update(id, request);
    }


    @PostMapping("/{id}/close")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'REQUIREMENT_VIEW')"
    )
    public void closeRequirement(@PathVariable Long id) {
        requirementService.close(id);
    }

}
