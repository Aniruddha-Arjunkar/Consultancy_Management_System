package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.agreement.AgreementResponse;
import com.shulventures.consultancymanagement.dto.agreement.CreateAgreementRequest;
import com.shulventures.consultancymanagement.service.AgreementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.shulventures.consultancymanagement.dto.agreement.UpdateAgreementRequest;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.http.HttpStatus;

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


    @PutMapping("/agreements/{id}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'CANDIDATES_VIEW')"
    )
    public AgreementResponse updateCandidate(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAgreementRequest request
    ) {
        return agreementService.updateCandidate(id, request);
    }

    @GetMapping("/agreements/{id}/resume")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'CANDIDATES_VIEW')"
    )
    public ResponseEntity<Resource> getCandidateResume(@PathVariable Long id) {
        try {
            Path path = agreementService.getResumePath(id);
            Resource resource = new FileSystemResource(path);

            String contentType = Files.probeContentType(path);
            MediaType mediaType = contentType == null
                    ? MediaType.APPLICATION_OCTET_STREAM
                    : MediaType.parseMediaType(contentType);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            ContentDisposition.inline()
                                    .filename(
                                            path.getFileName().toString(),
                                            StandardCharsets.UTF_8
                                    )
                                    .build()
                                    .toString()
                    )
                    .body(resource);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not open the resume."
            );
        }
    }

    @PatchMapping("/agreements/{id}/blacklist")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'CANDIDATES_VIEW')"
    )
    public AgreementResponse blacklistCandidate(@PathVariable Long id) {
        return agreementService.blacklistCandidate(id);
    }

    @DeleteMapping("/agreements/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'CANDIDATES_VIEW')"
    )
    public void deleteCandidate(@PathVariable Long id) {
        agreementService.deleteCandidate(id);
    }
}