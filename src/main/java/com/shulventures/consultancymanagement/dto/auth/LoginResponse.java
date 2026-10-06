package com.shulventures.consultancymanagement.dto.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String branch;
    private String accessModules;
}
