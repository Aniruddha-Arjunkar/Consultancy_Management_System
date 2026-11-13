package com.shulventures.consultancymanagement.dto.auth;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class LoginResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String branch;
    private String accessModules;
    private String phone;
    private String status;
    private LocalDateTime createdAt;
}
