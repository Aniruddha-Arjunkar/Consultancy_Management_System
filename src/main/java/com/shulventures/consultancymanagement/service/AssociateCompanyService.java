package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.associate.CreateAssociateCompanyRequest;
import com.shulventures.consultancymanagement.entity.AssociateCompany;
import com.shulventures.consultancymanagement.repository.AssociateCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import com.shulventures.consultancymanagement.dto.associate.AssociateCompanyResponse;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssociateCompanyService {

    private static final long MAX_SLA_SIZE = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("pdf", "doc", "docx", "jpg", "png");

    private final AssociateCompanyRepository associateCompanyRepository;

    @Value("${app.upload.sla-documents:uploads/sla}")
    private String slaUploadDirectory;

    @Transactional
    public AssociateCompany create(CreateAssociateCompanyRequest request) {
        validateRequest(request);

        String storedFilename = "";
        Path savedFile = null;

        try {
            MultipartFile upload = request.getSlaDocument();

            if (upload != null && !upload.isEmpty()) {
                String extension = StringUtils
                        .getFilenameExtension(upload.getOriginalFilename());

                extension = extension == null
                        ? ""
                        : extension.toLowerCase(Locale.ROOT);

                if (!ALLOWED_EXTENSIONS.contains(extension)) {
                    throw new IllegalArgumentException(
                            "Upload PDF, DOC, DOCX, JPG, or PNG files only."
                    );
                }

                if (upload.getSize() > MAX_SLA_SIZE) {
                    throw new IllegalArgumentException(
                            "The SLA document must be 10 MB or smaller."
                    );
                }

                Path root = Path.of(slaUploadDirectory)
                        .toAbsolutePath()
                        .normalize();

                Files.createDirectories(root);

                storedFilename = UUID.randomUUID() + "." + extension;
                savedFile = root.resolve(storedFilename).normalize();

                if (!savedFile.startsWith(root)) {
                    throw new IllegalArgumentException(
                            "Invalid SLA document path."
                    );
                }

                upload.transferTo(savedFile);
            }

            AssociateCompany company = new AssociateCompany();
            company.setCompanyName(request.getCompanyName().trim());
            company.setLocation(request.getLocation().trim());
            company.setWorkingDomain(request.getWorkingDomain().trim());
            company.setWorkingTechnology(request.getWorkingTechnology().trim());
            company.setNoOfEmployee(request.getNoOfEmployee().trim());
            company.setContactPerson(request.getContactPerson().trim());
            company.setPhone(request.getPhone().trim());
            company.setEmail(request.getEmail().trim());
            company.setManagerName(blankToNull(request.getManagerName()));
            company.setManagerPhone(blankToNull(request.getManagerPhone()));
            company.setManagerEmail(blankToNull(request.getManagerEmail()));
            company.setPayPackageFresher(
                    request.getPayPackageFresher().trim()
            );
            company.setPayPackageExperienced(
                    request.getPayPackageExperienced().trim()
            );
            company.setSlaAgreed(request.getSlaAgreed().trim());
            company.setPayForFresher(blankToNull(request.getPayForFresher()));
            company.setPayForExperienced(
                    blankToNull(request.getPayForExperienced())
            );
            company.setInvoiceSendText(
                    request.getInvoiceSendText() == null
                            ? ""
                            : request.getInvoiceSendText().trim()
            );
            company.setSlaDocument(storedFilename);

            return associateCompanyRepository.save(company);
        } catch (IOException exception) {
            deleteIfPresent(savedFile);
            throw new IllegalStateException(
                    "Could not save the SLA document.",
                    exception
            );
        } catch (RuntimeException exception) {
            deleteIfPresent(savedFile);
            throw exception;
        }
    }

    private void validateRequest(CreateAssociateCompanyRequest request) {
        if (request.getSlaAgreed() == null
                || request.getSlaAgreed().isBlank()) {
            request.setSlaAgreed("YES");
        }

        String sla = request.getSlaAgreed().trim().toUpperCase(Locale.ROOT);

        if (!Set.of("YES", "NO").contains(sla)) {
            throw new IllegalArgumentException("Select Yes or No for SLA Agreed.");
        }

        request.setSlaAgreed(sla);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void deleteIfPresent(Path path) {
        if (path == null) return;

        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // Preserve the original error.
        }
    }


    @Transactional(readOnly = true)
    public List<AssociateCompanyResponse> getAll() {
        return associateCompanyRepository.findAllByOrderByIdDesc()
                .stream()
                .map(company -> new AssociateCompanyResponse(
                        company.getId(),
                        company.getCompanyName(),
                        company.getLocation(),
                        company.getWorkingDomain(),
                        company.getWorkingTechnology(),
                        company.getNoOfEmployee(),
                        company.getContactPerson(),
                        company.getPhone(),
                        company.getEmail(),
                        company.getManagerName(),
                        company.getManagerPhone(),
                        company.getManagerEmail(),
                        company.getPayPackageFresher(),
                        company.getPayPackageExperienced(),
                        company.getSlaAgreed(),
                        company.getPayForFresher(),
                        company.getPayForExperienced(),
                        company.getGstNumber(),
                        company.getShippingAddress(),
                        company.getInvoiceNumber(),
                        company.getInvoiceSendText(),
                        company.getSlaDocument()
                ))
                .toList();
    }



    @Transactional(readOnly = true)
    public AssociateCompanyResponse getById(Long id) {
        AssociateCompany company = associateCompanyRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Associate company not found.")
                );

        return toResponse(company);
    }

    @Transactional(readOnly = true)
    public Path getSlaDocumentPath(Long id) {
        AssociateCompany company = associateCompanyRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Associate company not found.")
                );

        if (company.getSlaDocument() == null
                || company.getSlaDocument().isBlank()) {
            throw new IllegalArgumentException("No SLA document was uploaded.");
        }

        Path root = Path.of(slaUploadDirectory)
                .toAbsolutePath()
                .normalize();

        Path document = root.resolve(company.getSlaDocument())
                .normalize();

        if (!document.startsWith(root) || !Files.isRegularFile(document)) {
            throw new IllegalArgumentException("SLA document not found.");
        }

        return document;
    }

    private AssociateCompanyResponse toResponse(AssociateCompany company) {
        return new AssociateCompanyResponse(
                company.getId(),
                company.getCompanyName(),
                company.getLocation(),
                company.getWorkingDomain(),
                company.getWorkingTechnology(),
                company.getNoOfEmployee(),
                company.getContactPerson(),
                company.getPhone(),
                company.getEmail(),
                company.getManagerName(),
                company.getManagerPhone(),
                company.getManagerEmail(),
                company.getPayPackageFresher(),
                company.getPayPackageExperienced(),
                company.getSlaAgreed(),
                company.getPayForFresher(),
                company.getPayForExperienced(),
                company.getGstNumber(),
                company.getShippingAddress(),
                company.getInvoiceNumber(),
                company.getInvoiceSendText(),
                company.getSlaDocument()
        );
    }
}