package com.shulventures.consultancymanagement.dto.user;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private Long id;

    private String name;

    private String phone;

    private String email;

    private String role;

    private String branch;

    private String accessModules;

    private String status;

    private LocalDateTime lastActive;
}
