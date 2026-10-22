package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.agreement.AgreementResponse;
import com.shulventures.consultancymanagement.dto.agreement.CreateAgreementRequest;
import com.shulventures.consultancymanagement.service.AgreementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AgreementController {

    private final AgreementService agreementService;

    @PostMapping("/students/{studentId}/agreement")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'STUDENT_VIEW')"
    )
    public AgreementResponse convertStudent(
            @PathVariable Long studentId,
            @Valid @RequestBody CreateAgreementRequest request
    ) {
        return agreementService.convertStudent(studentId, request);
    }

    @GetMapping("/agreements")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'CANDIDATES_VIEW')"
    )
    public List<AgreementResponse> getCandidates() {
        return agreementService.getAll();
    }

    @GetMapping("/agreements/{id}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'CANDIDATES_VIEW')"
    )
    public AgreementResponse getCandidate(@PathVariable Long id) {
        return agreementService.getById(id);
    }
}