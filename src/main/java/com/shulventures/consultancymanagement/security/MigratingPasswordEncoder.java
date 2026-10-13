package com.shulventures.consultancymanagement.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Accepts legacy plain-text credentials only long enough to migrate them on
 * successful login. All newly stored passwords use BCrypt.
 */
@Component
public class MigratingPasswordEncoder implements PasswordEncoder {

    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        return bcrypt.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }

        if (isBcryptHash(storedPassword)) {
            return bcrypt.matches(rawPassword, storedPassword);
        }

        return MessageDigest.isEqual(
                rawPassword.toString().getBytes(StandardCharsets.UTF_8),
                storedPassword.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Override
    public boolean upgradeEncoding(String storedPassword) {
        return !isBcryptHash(storedPassword);
    }

    private boolean isBcryptHash(String value) {
        return value != null && value.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$");
    }
}
