package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.associate.CreateAssociateCompanyRequest;
import com.shulventures.consultancymanagement.dto.associate.UpdateAssociateCompanyRequest;
import com.shulventures.consultancymanagement.entity.AssociateCompany;
import com.shulventures.consultancymanagement.service.AssociateCompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import java.nio.file.Path;
import com.shulventures.consultancymanagement.dto.associate.AssociateCompanyResponse;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/associate-companies")
@RequiredArgsConstructor
public class AssociateCompanyController {

    private final AssociateCompanyService associateCompanyService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'ASSOCIATE_COMPANY_ADD')"
    )
    public Map<String, Object> createAssociateCompany(
            @Valid @ModelAttribute CreateAssociateCompanyRequest request
    ) {
        AssociateCompany company = associateCompanyService.create(request);

        return Map.of(
                "id", company.getId(),
                "companyName", company.getCompanyName(),
                "message", "Associate company added successfully."
        );
    }


    @GetMapping
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'ASSOCIATE_COMPANY_VIEW')"
    )
    public List<AssociateCompanyResponse> getAssociateCompanies() {
        return associateCompanyService.getAll();
    }



    @GetMapping("/{id}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'ASSOCIATE_COMPANY_VIEW')"
    )
    public AssociateCompanyResponse getAssociateCompany(
            @PathVariable Long id
    ) {
        return associateCompanyService.getById(id);
    }

    @GetMapping("/{id}/sla-document")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'ASSOCIATE_COMPANY_VIEW')"
    )
    public ResponseEntity<Resource> getSlaDocument(
            @PathVariable Long id
    ) {
        Path documentPath = associateCompanyService.getSlaDocumentPath(id);

        MediaType mediaType = MediaTypeFactory
                .getMediaType(documentPath.getFileName().toString())
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(new FileSystemResource(documentPath));
    }


    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'ASSOCIATE_COMPANY_VIEW')"
    )
    public AssociateCompanyResponse updateAssociateCompany(
            @PathVariable Long id,
            @Valid @ModelAttribute UpdateAssociateCompanyRequest request
    ) {
        return associateCompanyService.update(id, request);
    }
}