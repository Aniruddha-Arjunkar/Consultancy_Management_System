package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.entity.Employee;
import com.shulventures.consultancymanagement.entity.EmployeeDocument;
import com.shulventures.consultancymanagement.repository.EmployeeDocumentRepository;
import com.shulventures.consultancymanagement.repository.EmployeeRepository;
import com.shulventures.consultancymanagement.security.BranchPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import com.shulventures.consultancymanagement.dto.employee.EmployeeDocumentResponse;
import java.util.List;


@Service
@RequiredArgsConstructor
public class EmployeeDocumentService {

    private static final long MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

    private final EmployeeRepository employeeRepository;
    private final EmployeeDocumentRepository documentRepository;
    private final BranchPermissionService branchPermissionService;

    @Value("${app.upload.employee-documents:uploads/employee-documents}")
    private String documentDirectory;

    public EmployeeDocument upload(
            Long employeeId,
            String documentType,
            MultipartFile document,
            Authentication authentication
    ) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found.")
                );

        if (!branchPermissionService.hasBranchAccess(
                authentication,
                employee.getBranch()
        )) {
            throw new AccessDeniedException(
                    "You cannot upload documents for this branch."
            );
        }

        if (documentType == null || documentType.isBlank()) {
            throw new IllegalArgumentException("Document type is required.");
        }

        if (document == null || document.isEmpty()) {
            throw new IllegalArgumentException("Select a PDF document.");
        }

        if (document.getSize() > MAX_DOCUMENT_SIZE) {
            throw new IllegalArgumentException(
                    "The PDF must be 10 MB or smaller."
            );
        }

        String originalName =
                StringUtils.getFilename(document.getOriginalFilename());

        if (originalName == null ||
                !originalName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed.");
        }

        try {
            byte[] contents = document.getBytes();

            if (contents.length < 5 ||
                    !new String(
                            contents,
                            0,
                            5,
                            StandardCharsets.US_ASCII
                    ).equals("%PDF-")) {
                throw new IllegalArgumentException(
                        "The selected file is not a valid PDF."
                );
            }

            Path root = Path.of(documentDirectory)
                    .toAbsolutePath()
                    .normalize();

            Path employeeDirectory = root.resolve(employeeId.toString())
                    .normalize();

            if (!employeeDirectory.startsWith(root)) {
                throw new IllegalArgumentException("Invalid upload location.");
            }

            Files.createDirectories(employeeDirectory);

            String storedName = UUID.randomUUID() + ".pdf";
            Path destination = employeeDirectory.resolve(storedName);

            Files.write(destination, contents);

            EmployeeDocument savedDocument = new EmployeeDocument();
            savedDocument.setEmployeeId(Math.toIntExact(employeeId));
            savedDocument.setDocumentType(documentType.trim());
            savedDocument.setDocumentName(originalName);
            savedDocument.setFilePath(
                    employeeId + "/" + storedName
            );

            return documentRepository.save(savedDocument);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not save the employee document.",
                    exception
            );
        }
    }


    public List<EmployeeDocumentResponse> getDocuments(
            Long employeeId,
            Authentication authentication
    ) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found.")
                );

        if (!branchPermissionService.hasBranchAccess(
                authentication,
                employee.getBranch()
        )) {
            throw new AccessDeniedException(
                    "You cannot view documents for this branch."
            );
        }

        return documentRepository
                .findByEmployeeIdOrderByIdDesc(Math.toIntExact(employeeId))
                .stream()
                .map(document -> new EmployeeDocumentResponse(
                        document.getId(),
                        document.getDocumentType(),
                        document.getDocumentName()
                ))
                .toList();
    }

    public Path getDocumentPath(
            Long employeeId,
            Long documentId,
            Authentication authentication
    ) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found.")
                );

        if (!branchPermissionService.hasBranchAccess(
                authentication,
                employee.getBranch()
        )) {
            throw new AccessDeniedException(
                    "You cannot view documents for this branch."
            );
        }

        EmployeeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Document not found.")
                );

        if (!document.getEmployeeId().equals(Math.toIntExact(employeeId))) {
            throw new IllegalArgumentException(
                    "Document does not belong to this employee."
            );
        }

        Path root = Path.of(documentDirectory)
                .toAbsolutePath()
                .normalize();

        Path file = root.resolve(document.getFilePath())
                .normalize();

        if (!file.startsWith(root) || !Files.isRegularFile(file)) {
            throw new IllegalArgumentException("Document file not found.");
        }

        return file;
    }
}