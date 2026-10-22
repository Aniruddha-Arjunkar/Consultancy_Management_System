package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.registration.CreateStudentRegistrationRequest;
import com.shulventures.consultancymanagement.dto.registration.UpdateStudentRegistrationRequest;
import com.shulventures.consultancymanagement.entity.CurrentRequirement;
import com.shulventures.consultancymanagement.entity.StudentRegistration;
import com.shulventures.consultancymanagement.repository.CurrentRequirementRepository;
import com.shulventures.consultancymanagement.repository.StudentRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

import com.shulventures.consultancymanagement.dto.registration.StudentRegistrationResponse;
import com.shulventures.consultancymanagement.dto.registration.StudentRequirementOptionResponse;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentRegistrationService {

    private static final long MAX_RESUME_SIZE = 10L * 1024 * 1024;

    private static final Set<String> ALLOWED_RESUME_EXTENSIONS =
            Set.of("pdf", "doc", "docx");

    private final StudentRegistrationRepository registrationRepository;
    private final CurrentRequirementRepository requirementRepository;

    @Value("${app.upload.student-resumes:uploads/student-resumes}")
    private String resumeDirectory;


    private StudentRegistrationResponse toResponse(
            StudentRegistration student
    ) {
        return new StudentRegistrationResponse(
                student.getId(),
                student.getName(),
                student.getPhone(),
                student.getEmail(),
                student.getDob(),
                student.getExperienceDescription(),
                student.getGender(),
                student.getExperience(),
                student.getAddress(),
                student.getSkills(),
                student.getTenTh(),
                student.getTenThPercentage(),
                student.getTenThYearOfPassing(),
                student.getTwelveTh(),
                student.getTwelveThPercentage(),
                student.getTwelveThYearOfPassing(),
                student.getGraduation(),
                student.getGraduationPercentage(),
                student.getGraduationYearOfPassing(),
                student.getPostGraduation(),
                student.getPostGraduationPercentage(),
                student.getPostGraduationYearOfPassing(),
                student.getResume(),
                student.getJobProfile()
        );
    }

    @Transactional
    public StudentRegistrationResponse create(
            CreateStudentRegistrationRequest request
    ) {
        CurrentRequirement requirement = requirementRepository
                .findById(request.getRequirementId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Current requirement not found."
                        )
                );

//        if (requirement.getCloseDate() != null
//                && !requirement.getCloseDate().isBlank()) {
//            throw new IllegalArgumentException(
//                    "Students can only register for current requirements."
//            );
//        }

        StudentRegistration student = new StudentRegistration();

        BeanUtils.copyProperties(
                request,
                student,
                "requirementId",
                "resume"
        );

        student.setName(request.getName().trim());
        student.setPhone(request.getPhone().trim());
        student.setEmail(request.getEmail().trim());
        student.setGender(request.getGender().trim());
        student.setExperience(request.getExperience().trim());

        // These form fields are optional, but the database columns are NOT NULL.
        student.setExperienceDescription(
                emptyIfNull(request.getExperienceDescription())
        );
        student.setAddress(emptyIfNull(request.getAddress()));
        student.setSkills(emptyIfNull(request.getSkills()));

        // Store a snapshot of the selected current requirement's job profile.
        student.setJobProfile(requirement.getJobProfile());

        student.setResume(saveResume(request.getResume()));

        return toResponse(registrationRepository.save(student));
    }

    private String emptyIfNull(String value) {
        return value == null ? "" : value.trim();
    }

    private String saveResume(MultipartFile resume) {
        if (resume == null || resume.isEmpty()) {
            throw new IllegalArgumentException("Please upload a resume.");
        }

        if (resume.getSize() > MAX_RESUME_SIZE) {
            throw new IllegalArgumentException(
                    "Resume must be 10 MB or smaller."
            );
        }

        String extension = StringUtils
                .getFilenameExtension(resume.getOriginalFilename());

        if (extension == null
                || !ALLOWED_RESUME_EXTENSIONS.contains(
                extension.toLowerCase()
        )) {
            throw new IllegalArgumentException(
                    "Resume must be a PDF, DOC, or DOCX file."
            );
        }

        String filename =
                UUID.randomUUID() + "." + extension.toLowerCase();

        try {
            Path directory =
                    Path.of(resumeDirectory).toAbsolutePath().normalize();
            Files.createDirectories(directory);

            Path destination = directory.resolve(filename).normalize();

            if (!destination.startsWith(directory)) {
                throw new IllegalArgumentException(
                        "Invalid resume upload location."
                );
            }

            Files.copy(resume.getInputStream(), destination);

            return "uploads/student-resumes/" + filename;
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not save the resume.",
                    exception
            );
        }
    }

    @Transactional(readOnly = true)
    public List<StudentRequirementOptionResponse> getCurrentRequirementOptions() {
        return requirementRepository.findAllByOrderByIdDesc()
                .stream()
                .map(requirement -> new StudentRequirementOptionResponse(
                        requirement.getId(),
                        requirement.getAssociateCompany().getCompanyName(),
                        requirement.getJobProfile(),
                        requirement.getLocation()
                ))
                .toList();
    }


    @Transactional(readOnly = true)
    public List<StudentRegistrationResponse> getAll() {
        return registrationRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    @Transactional(readOnly = true)
    public StudentRegistrationResponse getById(Long id) {
        StudentRegistration student = registrationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student not found.")
                );

        return toResponse(student);
    }



    @Transactional(readOnly = true)
    public Path getResumePath(Long id) {
        StudentRegistration student = registrationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        if (student.getResume() == null || student.getResume().isBlank()) {
            throw new IllegalArgumentException("Resume not found.");
        }

        Path directory = Path.of(resumeDirectory).toAbsolutePath().normalize();
        String filename = Path.of(student.getResume()).getFileName().toString();
        Path file = directory.resolve(filename).normalize();

        if (!file.startsWith(directory) || !Files.isRegularFile(file)) {
            throw new IllegalArgumentException("Resume file not found.");
        }

        return file;
    }


    @Transactional
    public StudentRegistrationResponse update(
            Long id,
            UpdateStudentRegistrationRequest request
    ) {
        StudentRegistration student = registrationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student not found.")
                );

        student.setName(request.getName().trim());
        student.setPhone(request.getPhone().trim());
        student.setEmail(request.getEmail().trim());
        student.setDob(request.getDob());
        student.setGender(request.getGender().trim());
        student.setAddress(emptyIfNull(request.getAddress()));

        student.setTenThYearOfPassing(
                emptyIfNull(request.getTenThYearOfPassing())
        );
        student.setTenThPercentage(request.getTenThPercentage());

        student.setTwelveThYearOfPassing(
                emptyIfNull(request.getTwelveThYearOfPassing())
        );
        student.setTwelveThPercentage(request.getTwelveThPercentage());

        student.setGraduation(emptyIfNull(request.getGraduation()));
        student.setGraduationYearOfPassing(
                emptyIfNull(request.getGraduationYearOfPassing())
        );
        student.setGraduationPercentage(request.getGraduationPercentage());

        student.setPostGraduation(
                emptyIfNull(request.getPostGraduation())
        );
        student.setPostGraduationYearOfPassing(
                emptyIfNull(request.getPostGraduationYearOfPassing())
        );
        student.setPostGraduationPercentage(
                request.getPostGraduationPercentage()
        );

        student.setExperience(request.getExperience().trim());
        student.setExperienceDescription(
                emptyIfNull(request.getExperienceDescription())
        );
        student.setSkills(emptyIfNull(request.getSkills()));

        // Keep the current resume and job profile unchanged.
        return toResponse(registrationRepository.save(student));
    }
}
