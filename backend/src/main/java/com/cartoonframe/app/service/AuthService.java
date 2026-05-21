package com.cartoonframe.app.service;

import com.cartoonframe.app.dto.LoginRequestDTO;
import com.cartoonframe.app.dto.RegisterRequestDTO;
import com.cartoonframe.app.dto.ResponseDTO;
import com.cartoonframe.app.dto.UserSummaryDTO;
import com.cartoonframe.app.infra.security.TokenService;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.model.VerifierUser;
import com.cartoonframe.app.model.enums.Role;
import com.cartoonframe.app.model.enums.UserStatus;
import com.cartoonframe.app.repository.UserRepository;
import com.cartoonframe.app.repository.VerifierUserRepository;
import com.cartoonframe.app.util.ValidationUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final VerifierUserRepository verifierUserRepository;
    private final EmailService emailService;

    @Value("${app.base-url}")
    private String baseUrl;

    public AuthService(UserRepository repository, PasswordEncoder passwordEncoder, TokenService tokenService, VerifierUserRepository verifierUserRepository, EmailService emailService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.verifierUserRepository = verifierUserRepository;
        this.emailService = emailService;
    }

    public ResponseDTO login(LoginRequestDTO dto) {
        Optional<User> userOpt;
        if (dto.identifier().contains("@")) {
            userOpt = repository.findByEmail(dto.identifier());
        } else {
            userOpt = repository.findByNickname(dto.identifier());
        }

        User user = userOpt.orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new IllegalArgumentException("Senha incorreta");
        }

        if (user.getUserStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException("Email não verificado. Por favor, verifique seu email antes de fazer login.");
        }

        String token = tokenService.generateToken(user);
        return new ResponseDTO(user.getName(), token, user.getRole().name());
    }

    public UserSummaryDTO register(RegisterRequestDTO dto) {
        ValidationUtils.validateEmail(dto.email());
        ValidationUtils.validatePassword(dto.password());

        if (repository.findByEmail(dto.email()).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        if (repository.findByNickname(dto.nickname()).isPresent()) {
            throw new IllegalArgumentException("Nickname já está em uso");
        }

        User newUser = new User();
        newUser.setRole(Role.USER);
        newUser.setName(dto.name());
        newUser.setEmail(dto.email());
        newUser.setNickname(dto.nickname());
        newUser.setPassword(passwordEncoder.encode(dto.password()));
        newUser.setRegistrationDate(LocalDate.now());
        newUser.setUserStatus(UserStatus.PENDING);
        repository.save(newUser);

        VerifierUser verifierUser = new VerifierUser();
        verifierUser.setUser(newUser);
        verifierUser.setUuid(UUID.randomUUID());
        verifierUser.setExpirationDate(Instant.now().plusSeconds(86400));
        verifierUserRepository.save(verifierUser);

        String link = baseUrl + "/auth/verify?uuid=" + verifierUser.getUuid();
        emailService.sendEmailText(
                newUser.getEmail(),
                "Verificação de Conta - CartoonFrame",
                "Olá " + newUser.getName() + ",\n\nClique no link abaixo para verificar sua conta:\n" + link
        );

        return UserSummaryDTO.from(newUser);
    }

    public void verifyEmail(UUID uuid) {
        VerifierUser verifier = verifierUserRepository.findByUuid(uuid)
                .orElseThrow(() -> new IllegalArgumentException("UUID inválido"));

        if (verifier.getExpirationDate().isBefore(Instant.now())) {
            throw new IllegalStateException("O link de verificação expirou");
        }

        User user = verifier.getUser();
        user.setUserStatus(UserStatus.ACTIVE);
        repository.save(user);

        verifierUserRepository.delete(verifier);
    }

    public UserSummaryDTO getProfile(User user) {
        return UserSummaryDTO.from(user);
    }
}