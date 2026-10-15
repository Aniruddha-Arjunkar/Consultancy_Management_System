package com.shulventures.consultancymanagement.dto.employee;

public record EmployeeDocumentResponse(
        Long id,
        String documentType,
        String documentName
) {}