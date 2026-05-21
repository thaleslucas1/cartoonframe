package com.cartoonframe.app.service;

import com.cartoonframe.app.model.PasswordResetToken;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.PasswordResetTokenRepository;
import com.cartoonframe.app.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void sendResetCode(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email não encontrado"));

        String code = String.format("%06d", secureRandom.nextInt(999999));

        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setCode(code);
        token.setExpirationTime(Instant.now().plusSeconds(600));
        token.setUsed(false);
        tokenRepository.save(token);

        emailService.sendEmailText(
                email,
                "Código para Redefinição de Senha",
                "Seu código de redefinição é: " + code
        );
    }

    public void confirmCode(String email, String code) {
        PasswordResetToken token = tokenRepository
                .findByEmailAndCodeAndUsedFalse(email, code)
                .orElseThrow(() -> new IllegalArgumentException("Código inválido ou expirado"));

        if (token.getExpirationTime().isBefore(Instant.now())) {
            throw new IllegalStateException("Código expirado");
        }
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email não encontrado"));

        tokenRepository.findByEmailAndUsedFalse(email).stream()
                .filter(t -> t.getExpirationTime().isAfter(Instant.now()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Nenhum código válido confirmado para este email"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        List<PasswordResetToken> tokens = tokenRepository.findByEmailAndUsedFalse(email).stream()
                .peek(t -> t.setUsed(true))
                .toList();
        tokenRepository.saveAll(tokens);
    }
}