package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.auth.LoginRequest;
import com.shulventures.consultancymanagement.dto.auth.LoginResponse;
import com.shulventures.consultancymanagement.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.*;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import com.shulventures.consultancymanagement.repository.UserRepository;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(
                context,
                httpRequest,
                httpResponse
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        var user = userDetails.getUser();

        user.setLastActive(LocalDateTime.now());
        user.setPresenceStatus("ONLINE");
        user = userRepository.save(user);

        return LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .branch(user.getBranch())
                .accessModules(user.getAccessModules())
                .phone(user.getPhone())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .presenceStatus(user.getPresenceStatus())
                .build();
    }

    @GetMapping("/me")
    public LoginResponse currentUser(Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        var user = userDetails.getUser();

        return LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .branch(user.getBranch())
                .accessModules(user.getAccessModules())
                .phone(user.getPhone())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .presenceStatus(user.getPresenceStatus())
                .build();
    }

//    @PostMapping("/logout")
//    public void logout(HttpServletRequest request) {
//
//        SecurityContextHolder.clearContext();
//
//        var session = request.getSession(false);
//
//        if (session != null) {
//            session.invalidate();
//        }
//    }


    @PostMapping("/logout")
    public void logout(
            HttpServletRequest request,
            Authentication authentication
    ) {
        try {
            if (authentication != null
                    && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
                var user = userDetails.getUser();
                user.setPresenceStatus("OFFLINE");
                userRepository.save(user);
            }
        } finally {
            SecurityContextHolder.clearContext();
            var session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
        }
    }
}
