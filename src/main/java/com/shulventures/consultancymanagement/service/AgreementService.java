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

@Service
@RequiredArgsConstructor
public class AgreementService {

    private final AgreementRepository agreementRepository;
    private final StudentRegistrationRepository registrationRepository;

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
}