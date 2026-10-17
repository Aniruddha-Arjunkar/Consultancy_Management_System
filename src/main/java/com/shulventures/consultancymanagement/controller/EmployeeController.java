package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.employee.*;
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

import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaTypeFactory;
import java.nio.file.Path;

import com.shulventures.consultancymanagement.entity.EmployeeDocument;
import com.shulventures.consultancymanagement.service.EmployeeDocumentService;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpHeaders;

import com.shulventures.consultancymanagement.service.EmployeeLetterService;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeDocumentService employeeDocumentService;
    private final EmployeeLetterService employeeLetterService;

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

    @GetMapping("/letters/options")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'GENERATE_LETTER')"
    )
    public List<EmployeeListItemResponse> getEmployeesForLetter(Authentication authentication) {
        return employeeService.getEmployeesForUser(authentication, "all");
    }

    @GetMapping(
            value = "/{employeeId}/letter",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'GENERATE_LETTER')"
    )
    public ResponseEntity<byte[]> generateEmployeeLetter(
            @PathVariable Long employeeId,
            @RequestParam("type") String letterType,
            Authentication authentication
    ) {
        byte[] pdf = employeeLetterService.generateLetterPdf(
                employeeId,
                letterType,
                authentication
        );

        String safeType = letterType.trim()
                .toLowerCase(java.util.Locale.ROOT)
                .replaceAll("[^a-z0-9_-]", "");

        String filename = safeType + "_letter_" + employeeId + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename + "\""
                )
                .body(pdf);
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


    @PostMapping(
            value = "/{employeeId}/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'ADD')"
    )
    public ResponseEntity<Map<String, Object>> uploadEmployeeDocument(
            @PathVariable Long employeeId,
            @RequestParam("documentType") String documentType,
            @RequestParam("document") MultipartFile document,
            Authentication authentication
    ) {
        EmployeeDocument savedDocument = employeeDocumentService.upload(
                employeeId,
                documentType,
                document,
                authentication
        );

        Map<String, Object> response = Map.of(
                "id", savedDocument.getId(),
                "documentType", savedDocument.getDocumentType(),
                "documentName", savedDocument.getDocumentName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @GetMapping("/{employeeId}/documents")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'VIEW')"
    )
    public List<EmployeeDocumentResponse> getEmployeeDocuments(
            @PathVariable Long employeeId,
            Authentication authentication
    ) {
        return employeeDocumentService.getDocuments(
                employeeId,
                authentication
        );
    }

    @GetMapping("/{employeeId}/documents/{documentId}/file")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'VIEW')"
    )
    public ResponseEntity<Resource> getEmployeeDocumentFile(
            @PathVariable Long employeeId,
            @PathVariable Long documentId,
            Authentication authentication
    ) {
        Path documentPath = employeeDocumentService.getDocumentPath(
                employeeId,
                documentId,
                authentication
        );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(new FileSystemResource(documentPath));
    }


    @PutMapping(
            value = "/{employeeId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'VIEW')"
    )
    public ResponseEntity<Map<String, Object>> updateEmployee(
            @PathVariable Long employeeId,
            @ModelAttribute CreateEmployeeRequest request,
            Authentication authentication
    ) {
        Employee employee = employeeService.update(
                employeeId,
                request,
                authentication
        );

        Map<String, Object> response = Map.of(
                "id", employee.getId(),
                "message", "Employee updated successfully."
        );

        return ResponseEntity.ok(response);
    }


    @PutMapping("/{employeeId}/resignation")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'EMPLOYEE', 'VIEW')"
    )
    public ResponseEntity<Map<String, Object>> processEmployeeResignation(
            @PathVariable Long employeeId,
            @RequestBody EmployeeResignationRequest request,
            Authentication authentication
    ) {
        Employee employee = employeeService.processResignation(
                employeeId,
                request,
                authentication
        );

        return ResponseEntity.ok(Map.of(
                "id", employee.getId(),
                "message", "Employee resignation processed successfully."
        ));
    }
}
