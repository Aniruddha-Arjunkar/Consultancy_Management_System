package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.agreement.AgreementResponse;
import com.shulventures.consultancymanagement.dto.agreement.CreateAgreementRequest;
import com.shulventures.consultancymanagement.entity.Agreement;
import com.shulventures.consultancymanagement.entity.StudentRegistration;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.StudentRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.shulventures.consultancymanagement.dto.agreement.UpdateAgreementRequest;
import org.springframework.beans.factory.annotation.Value;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AgreementService {

    private final AgreementRepository agreementRepository;
    private final StudentRegistrationRepository registrationRepository;

    @Value("${app.upload.student-resumes:uploads/student-resumes}")
    private String resumeDirectory;

    @Transactional
    public AgreementResponse convertStudent(
            Long studentId,
            CreateAgreementRequest request
    ) {
        String status = request.status().trim();

        if ("Agreed".equals(status) && request.agreementDate() == null) {
            throw new IllegalArgumentException(
                    "Agreement date is required for PCA Agreed."
            );
        }

        StudentRegistration student = registrationRepository.findById(studentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student not found.")
                );

        Agreement agreement = new Agreement();
        agreement.setName(student.getName());
        agreement.setEmail(student.getEmail());
        agreement.setPhone(student.getPhone());
        agreement.setDob(student.getDob());
        agreement.setAgreementDate(
                "Agreed".equals(status) ? request.agreementDate() : null
        );
        agreement.setGender(student.getGender());

        agreement.setTenTh(textOrEmpty(student.getTenTh()));
        agreement.setTenThPercentage(student.getTenThPercentage());
        agreement.setTenThYearOfPassing(
                textOrEmpty(student.getTenThYearOfPassing())
        );

        agreement.setTwelveTh(textOrEmpty(student.getTwelveTh()));
        agreement.setTwelveThPercentage(student.getTwelveThPercentage());
        agreement.setTwelveThYearOfPassing(
                textOrEmpty(student.getTwelveThYearOfPassing())
        );

        agreement.setGraduation(textOrEmpty(student.getGraduation()));
        agreement.setGraduationPercentage(student.getGraduationPercentage());
        agreement.setGraduationYearOfPassing(
                textOrEmpty(student.getGraduationYearOfPassing())
        );

        agreement.setPostGraduation(
                textOrEmpty(student.getPostGraduation())
        );
        agreement.setPostGraduationPercentage(
                student.getPostGraduationPercentage()
        );
        agreement.setPostGraduationYearOfPassing(
                textOrEmpty(student.getPostGraduationYearOfPassing())
        );

        agreement.setAddress(textOrEmpty(student.getAddress()));
        agreement.setExperience(textOrEmpty(student.getExperience()));
        agreement.setSkills(textOrEmpty(student.getSkills()));
        agreement.setExperienceDescription(
                textOrEmpty(student.getExperienceDescription())
        );

        agreement.setStatus(status);
        agreement.setResume(student.getResume());
        agreement.setJobProfile(student.getJobProfile());

        Agreement savedAgreement = agreementRepository.save(agreement);

        // Transaction ensures the registration stays if saving the agreement fails.
        registrationRepository.delete(student);

        return toResponse(savedAgreement);
    }

    @Transactional(readOnly = true)
    public List<AgreementResponse> getAll() {
        return agreementRepository
                .findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AgreementResponse getById(Long id) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
                );

        return toResponse(agreement);
    }

    private String textOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private AgreementResponse toResponse(Agreement agreement) {
        return new AgreementResponse(
                agreement.getId(),
                agreement.getName(),
                agreement.getEmail(),
                agreement.getPhone(),
                agreement.getDob(),
                agreement.getAgreementDate(),
                agreement.getGender(),
                agreement.getTenTh(),
                agreement.getTenThPercentage(),
                agreement.getTenThYearOfPassing(),
                agreement.getTwelveTh(),
                agreement.getTwelveThPercentage(),
                agreement.getTwelveThYearOfPassing(),
                agreement.getGraduation(),
                agreement.getGraduationPercentage(),
                agreement.getGraduationYearOfPassing(),
                agreement.getPostGraduation(),
                agreement.getPostGraduationPercentage(),
                agreement.getPostGraduationYearOfPassing(),
                agreement.getAddress(),
                agreement.getExperience(),
                agreement.getSkills(),
                agreement.getExperienceDescription(),
                agreement.getStatus(),
                agreement.getShippingAddress(),
                agreement.getGstNumber(),
                agreement.getResume(),
                agreement.getJobProfile()
        );
    }


    @Transactional
    public AgreementResponse updateCandidate(
            Long id,
            UpdateAgreementRequest request
    ) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
                );

        agreement.setName(request.name().trim());
        agreement.setEmail(request.email().trim());
        agreement.setPhone(request.phone().trim());
        agreement.setDob(request.dob());
        agreement.setAgreementDate(request.agreementDate());
        agreement.setGender(request.gender().trim());

        agreement.setTenTh(textOrEmpty(request.tenTh()));
        agreement.setTenThPercentage(request.tenThPercentage());
        agreement.setTenThYearOfPassing(
                textOrEmpty(request.tenThYearOfPassing())
        );

        agreement.setTwelveTh(textOrEmpty(request.twelveTh()));
        agreement.setTwelveThPercentage(request.twelveThPercentage());
        agreement.setTwelveThYearOfPassing(
                textOrEmpty(request.twelveThYearOfPassing())
        );

        agreement.setGraduation(textOrEmpty(request.graduation()));
        agreement.setGraduationPercentage(request.graduationPercentage());
        agreement.setGraduationYearOfPassing(
                textOrEmpty(request.graduationYearOfPassing())
        );

        agreement.setPostGraduation(textOrEmpty(request.postGraduation()));
        agreement.setPostGraduationPercentage(
                request.postGraduationPercentage()
        );
        agreement.setPostGraduationYearOfPassing(
                textOrEmpty(request.postGraduationYearOfPassing())
        );

        agreement.setAddress(textOrEmpty(request.address()));
        agreement.setShippingAddress(textOrEmpty(request.shippingAddress()));
        agreement.setGstNumber(textOrEmpty(request.gstNumber()));
        agreement.setExperience(textOrEmpty(request.experience()));
        agreement.setSkills(textOrEmpty(request.skills()));
        agreement.setExperienceDescription(
                textOrEmpty(request.experienceDescription())
        );
        agreement.setStatus(request.status().trim());

        // Keep the existing resume and job profile.
        return toResponse(agreementRepository.save(agreement));
    }

    @Transactional(readOnly = true)
    public Path getResumePath(Long id) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
                );

        if (agreement.getResume() == null || agreement.getResume().isBlank()) {
            throw new IllegalArgumentException("Resume not found.");
        }

        Path directory = Path.of(resumeDirectory).toAbsolutePath().normalize();
        Path filename = Path.of(agreement.getResume()).getFileName();

        if (filename == null) {
            throw new IllegalArgumentException("Resume file not found.");
        }

        Path file = directory.resolve(filename).normalize();

        if (!file.startsWith(directory) || !Files.isRegularFile(file)) {
            throw new IllegalArgumentException("Resume file not found.");
        }

        return file;
    }


    @Transactional
    public AgreementResponse blacklistCandidate(Long id) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
                );

        if (!"Blacklisted".equals(agreement.getStatus())) {
            agreement.setStatus("Blacklisted");
            agreement = agreementRepository.save(agreement);
        }

        return toResponse(agreement);
    }


    @Transactional
    public void deleteCandidate(Long id) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
                );

        Path resumeFile = getResumeFileForDeletion(agreement.getResume());

        agreementRepository.delete(agreement);

        if (resumeFile != null) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            try {
                                Files.deleteIfExists(resumeFile);
                            } catch (IOException ignored) {
                                // The candidate record is deleted; a missing or
                                // inaccessible resume file does not undo that deletion.
                            }
                        }
                    }
            );
        }
    }

    private Path getResumeFileForDeletion(String resume) {
        if (resume == null || resume.isBlank()) {
            return null;
        }

        Path directory = Path.of(resumeDirectory)
                .toAbsolutePath()
                .normalize();

        Path filename = Path.of(resume).getFileName();

        if (filename == null) {
            return null;
        }

        Path file = directory.resolve(filename).normalize();

        if (!file.startsWith(directory)) {
            throw new IllegalArgumentException("Invalid resume file path.");
        }

        return file;
    }
}