package com.cartoonframe.app.service;

import com.cartoonframe.app.model.PasswordResetToken;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.PasswordResetTokenRepository;
import com.cartoonframe.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public void sendResetCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado"));

        String code = String.format("%06d", new Random().nextInt(999999));
        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setCode(code);
        token.setExpirationTime(Instant.now().plusSeconds(600));
        token.setUsed(false);
        tokenRepository.save(token);

        emailService.sendEmailText(email, "Código para Redefinição de Senha",
                "Seu código de redefinição é: " + code);
    }

    public void confirmCode(String email, String code) {
        PasswordResetToken token = tokenRepository
                .findByEmailAndCodeAndUsedFalse(email, code)
                .orElseThrow(() -> new RuntimeException("Código inválido ou expirado"));

        if (token.getExpirationTime().isBefore(Instant.now())) {
            throw new RuntimeException("Código expirado");
        }
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.findAll().stream()
                .filter(t -> t.getEmail().equals(email) && !t.isUsed())
                .forEach(t -> {
                    t.setUsed(true);
                    tokenRepository.save(t);
                });
    }
}
