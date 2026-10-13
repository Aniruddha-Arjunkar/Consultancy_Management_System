package com.shulventures.consultancymanagement.security;

import com.shulventures.consultancymanagement.entity.User;
import com.shulventures.consultancymanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService, UserDetailsPasswordService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );

        return new CustomUserDetails(user);
    }

    @Override
    public UserDetails updatePassword(UserDetails userDetails, String newPassword) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + userDetails.getUsername()
                ));

        // DaoAuthenticationProvider passes the already encoded replacement.
        user.setPassword(newPassword);
        return new CustomUserDetails(userRepository.save(user));
    }
}
