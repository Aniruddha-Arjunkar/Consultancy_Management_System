package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.registration.CreateStudentRegistrationRequest;
import com.shulventures.consultancymanagement.dto.registration.StudentRegistrationResponse;
import com.shulventures.consultancymanagement.dto.registration.StudentRequirementOptionResponse;
import com.shulventures.consultancymanagement.dto.registration.UpdateStudentRegistrationRequest;
import com.shulventures.consultancymanagement.service.StudentRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentRegistrationController {

    private final StudentRegistrationService registrationService;

    @GetMapping("/requirements")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'STUDENT_ADD')"
    )
    public List<StudentRequirementOptionResponse> getCurrentRequirements() {
        return registrationService.getCurrentRequirementOptions();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'STUDENT_ADD')"
    )
    public StudentRegistrationResponse registerStudent(
            @Valid @ModelAttribute CreateStudentRegistrationRequest request
    ) {
        return registrationService.create(request);
    }


    @GetMapping
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'STUDENT_VIEW')"
    )
    public List<StudentRegistrationResponse> getStudents() {
        return registrationService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'STUDENT_VIEW')"
    )
    public StudentRegistrationResponse getStudent(@PathVariable Long id) {
        return registrationService.getById(id);
    }


    @GetMapping("/{id}/resume")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'STUDENT_VIEW')"
    )
    public ResponseEntity<Resource> getStudentResume(@PathVariable Long id) {
        try {
            Path path = registrationService.getResumePath(id);
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
                                    .filename(path.getFileName().toString(), StandardCharsets.UTF_8)
                                    .build()
                                    .toString()
                    )
                    .body(resource);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, exception.getMessage());
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not open the resume."
            );
        }
    }


    @PutMapping("/{id}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'STUDENT_VIEW')"
    )
    public StudentRegistrationResponse updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudentRegistrationRequest request
    ) {
        return registrationService.update(id, request);
    }


    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'STUDENT_VIEW')"
    )
    public void deleteStudent(@PathVariable Long id) {
        registrationService.delete(id);
    }
}
