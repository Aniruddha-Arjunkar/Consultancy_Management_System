package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.employee.CreateEmployeeRequest;
import com.shulventures.consultancymanagement.entity.Employee;
import com.shulventures.consultancymanagement.repository.EmployeeRepository;
import com.shulventures.consultancymanagement.security.BranchPermissionService;
import com.shulventures.consultancymanagement.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

import com.shulventures.consultancymanagement.dto.employee.EmployeeListItemResponse;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private static final long MAX_PHOTO_SIZE = 5 * 1024 * 1024;

    private static final Map<String, String> PHOTO_EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final EmployeeRepository employeeRepository;
    private final BranchPermissionService branchPermissionService;

    @Value("${app.upload.employee-photos:uploads/employees}")
    private String photoDirectory;

    public Employee create(
            CreateEmployeeRequest request,
            Authentication authentication
    ) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Employee title is required.");
        }

        if (request.getCustName() == null || request.getCustName().isBlank()) {
            throw new IllegalArgumentException("Employee name is required.");
        }

        if (!(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new AccessDeniedException("Authenticated user details are unavailable.");
        }

        String requestedBranch = request.getBranch();

        if (!branchPermissionService.hasBranchAccess(authentication, requestedBranch)) {
            throw new AccessDeniedException("You cannot add an employee to that branch.");
        }

        String userBranch = userDetails.getUser().getBranch();
        boolean isSuperAdmin =
                "SUPER_ADMIN".equalsIgnoreCase(userDetails.getUser().getRole());

        // A user assigned to one branch can only create employees in that branch.
        // SUPER_ADMIN and users assigned to ALL must select a specific branch.
        String employeeBranch =
                !isSuperAdmin && userBranch != null
                        && !userBranch.isBlank()
                        && !"ALL".equalsIgnoreCase(userBranch)
                        ? userBranch
                        : requestedBranch;

        employeeBranch = normalizeBranch(employeeBranch);

        Employee employee = new Employee();
        BeanUtils.copyProperties(request, employee, "photo", "branch");
        employee.setBranch(employeeBranch);
        employee.setPhoto(savePhoto(request.getPhoto()));

        Employee savedEmployee = employeeRepository.save(employee);
        savedEmployee.setEmpId(
                "SHUL-" + String.format("%02d", savedEmployee.getId())
        );

        return employeeRepository.save(savedEmployee);
    }

    private String normalizeBranch(String branch) {
        if (branch == null || branch.isBlank()) {
            throw new IllegalArgumentException("Employee branch is required.");
        }

        return switch (branch.trim().toUpperCase()) {
            case "NAGPUR" -> "Nagpur";
            case "BRAMHAPURI" -> "Bramhapuri";
            case "CHANDRAPUR" -> "Chandrapur";
            default -> throw new IllegalArgumentException("Invalid employee branch.");
        };
    }

    private String savePhoto(MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            return null;
        }

        if (photo.getSize() > MAX_PHOTO_SIZE) {
            throw new IllegalArgumentException("Photo must be 5 MB or smaller.");
        }

        String extension = PHOTO_EXTENSIONS.get(photo.getContentType());
        if (extension == null) {
            throw new IllegalArgumentException(
                    "Photo must be a JPEG, PNG, or WebP image."
            );
        }

        try {
            Path directory = Path.of(photoDirectory).toAbsolutePath().normalize();
            Files.createDirectories(directory);

            String filename = UUID.randomUUID() + extension;
            Path destination = directory.resolve(filename);

            Files.copy(photo.getInputStream(), destination);

            return "uploads/employees/" + filename;
        } catch (IOException exception) {
            throw new IllegalStateException("Could not save the employee photo.", exception);
        }
    }


    public List<EmployeeListItemResponse> getEmployeesForUser(
            Authentication authentication,String status
    ) {
        if (!(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new AccessDeniedException("Authenticated user details are unavailable.");
        }

        String role = userDetails.getUser().getRole();
        String branch = userDetails.getUser().getBranch();

        List<Employee> employees;

        if ("SUPER_ADMIN".equalsIgnoreCase(role)
                || "ALL".equalsIgnoreCase(branch)) {
            employees = employeeRepository.findAll();
        } else {
            if (branch == null || branch.isBlank()) {
                throw new AccessDeniedException("Your account has no assigned branch.");
            }
            employees = employeeRepository.findByBranchIgnoreCase(branch);
        }
        String normalizedStatus =
                status == null ? "all" : status.trim().toLowerCase();

        return employees.stream()
                .filter(employee -> {
                    String resignationType = employee.getResignationType();

                    return switch (normalizedStatus) {
                        case "regular" ->
                                !"With Notice".equalsIgnoreCase(resignationType)
                                        && !"Without Notice".equalsIgnoreCase(resignationType)
                                        && !"Abscond".equalsIgnoreCase(resignationType);
                        case "all" -> true;
                        case "exit" ->
                                "With Notice".equalsIgnoreCase(resignationType)
                                        || "Without Notice".equalsIgnoreCase(resignationType);
                        case "abscond" ->
                                "Abscond".equalsIgnoreCase(resignationType);
                        default -> throw new IllegalArgumentException(
                                "Invalid employee list status."
                        );
                    };
                })
                .map(employee -> new EmployeeListItemResponse(
                        employee.getId(),
                        employee.getTitle(),
                        employee.getCustName(),
                        employee.getCustPhone(),
                        employee.getCustEmail(),
                        employee.getJoiningDate(),
                        employee.getDesignation(),
                        employee.getResignationType()
                ))
                .toList();
    }
}
