package com.shulventures.consultancymanagement.config;

import com.shulventures.consultancymanagement.entity.User;
import com.shulventures.consultancymanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        String email = "admin@consultancy.com";

        if (userRepository.findByEmail(email).isEmpty()) {

            User admin = new User();

            admin.setName("Admin");
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole("SUPER_ADMIN");
            admin.setBranch("ALL");
            admin.setStatus("ACTIVE");
            admin.setPhone(null);
            admin.setAccessModules("ALL");

            userRepository.save(admin);

            System.out.println("========================================");
            System.out.println("Development Super Admin created");
            System.out.println("Email    : admin@consultancy.com");
            System.out.println("Password : Admin@123");
            System.out.println("Role     : SUPER_ADMIN");
            System.out.println("========================================");
        }
    }
}
