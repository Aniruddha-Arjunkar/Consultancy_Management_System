package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.user.CreateUserRequest;
import com.shulventures.consultancymanagement.dto.user.UpdateUserRequest;
import com.shulventures.consultancymanagement.dto.user.UserResponse;
import com.shulventures.consultancymanagement.entity.User;
import com.shulventures.consultancymanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());

        // Never store plain-text passwords
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(normalizeRole(request.getRole()));
        user.setBranch(normalizeBranch(request.getBranch()));

        user.setAccessModules(
                normalizeAccessModules(request.getAccessModules())
        );

        user.setStatus(
                request.getStatus() == null ||
                        request.getStatus().isBlank()
                        ? "ACTIVE"
                        : request.getStatus().toUpperCase()
        );

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found with id: " + id)
                );

        return toResponse(user);
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (request.getEmail() != null &&
                !request.getEmail().isBlank() &&
                !request.getEmail().equalsIgnoreCase(user.getEmail())) {

            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Another user already exists with this email");
            }

            user.setEmail(request.getEmail());
        }

        if (request.getName() != null &&
                !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getPassword() != null &&
                !request.getPassword().isBlank()) {

            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null &&
                !request.getRole().isBlank()) {

            user.setRole(normalizeRole(request.getRole()));
        }

        if (request.getBranch() != null &&
                !request.getBranch().isBlank()) {

            user.setBranch(normalizeBranch(request.getBranch()));
        }

        if (request.getAccessModules() != null) {

            user.setAccessModules(normalizeAccessModules(request.getAccessModules()));
        }

        if (request.getStatus() != null &&
                !request.getStatus().isBlank()) {

            user.setStatus(request.getStatus().toUpperCase());
        }

        User updatedUser = userRepository.save(user);

        return toResponse(updatedUser);
    }

    public UserResponse updateStatus(Long id, String status) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found with id: " + id)
                );

        user.setStatus(status.toUpperCase());

        return toResponse(userRepository.save(user));
    }

    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
    }

    private UserResponse toResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .branch(user.getBranch())
                .accessModules(user.getAccessModules())
                .status(user.getStatus())
                .lastActive(user.getLastActive())
                .build();
    }

    private String normalizeRole(String role) {

        if (role == null || role.isBlank()) {
            return "USER";
        }

        return role.trim().toUpperCase();
    }

    private String normalizeBranch(String branch) {

        if (branch == null || branch.isBlank()) {
            return "ALL";
        }

        return branch.trim();
    }

    private String normalizeAccessModules(String modules) {

        if (modules == null || modules.isBlank()) {
            return "";
        }

        return modules.trim();
    }
}