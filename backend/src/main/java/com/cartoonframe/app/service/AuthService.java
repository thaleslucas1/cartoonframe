package com.cartoonframe.app.service;

import com.cartoonframe.app.dto.LoginRequestDTO;
import com.cartoonframe.app.dto.RegisterRequestDTO;
import com.cartoonframe.app.dto.ResponseDTO;
import com.cartoonframe.app.dto.UserSummaryDTO;
import com.cartoonframe.app.infra.security.TokenService;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.model.VerifierUser;
import com.cartoonframe.app.model.enums.UserStatus;
import com.cartoonframe.app.repository.UserRepository;
import com.cartoonframe.app.repository.VerifierUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final VerifierUserRepository VerifierUserRepository;
    private final EmailService emailService;

    public ResponseDTO login(LoginRequestDTO dto) {
        Optional<User> userOpt;
        if (dto.identifier().contains("@")) {
            userOpt = repository.findByEmail(dto.identifier());
        } else {
            userOpt = repository.findByNickname(dto.identifier());
        }

        User user = userOpt.orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new RuntimeException("Senha incorreta");
        }

        String token = tokenService.generateToken(user);
        return new ResponseDTO(user.getName(), token);
    }

    public UserSummaryDTO register(RegisterRequestDTO dto) {
        if (repository.findByEmail(dto.email()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        if (repository.findByNickname(dto.nickname()).isPresent()) {
            throw new RuntimeException("Nickname já está em uso");
        }

        User newUser = new User();
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
        VerifierUserRepository.save(verifierUser);

        String link = "http://localhost:8080/auth/verify?uuid=" + verifierUser.getUuid();
        emailService.sendEmailText(
                newUser.getEmail(),
                "Verificação de Conta - CartoonFrame",
                "Olá " + newUser.getName() + ",\n\nClique no link abaixo para verificar sua conta:\n" + link
        );

        UserSummaryDTO dtoSummary = new UserSummaryDTO();
        dtoSummary.id = newUser.getId().toString();
        dtoSummary.name = newUser.getName();
        dtoSummary.email = newUser.getEmail();
        dtoSummary.nickname = newUser.getNickname();
        dtoSummary.score = newUser.getScore();

        return dtoSummary;
    }

    public void verifyEmail(UUID uuid) {
        VerifierUser verifier = VerifierUserRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("UUID inválido"));

        if (verifier.getExpirationDate().isBefore(Instant.now())) {
            throw new RuntimeException("O link de verificação expirou");
        }

        User user = verifier.getUser();
        user.setUserStatus(UserStatus.ACTIVE);
        repository.save(user);

        VerifierUserRepository.delete(verifier); //
    }

    public UserSummaryDTO getProfile(String token) {
        String email = tokenService.validateToken(token);
        if (email == null) {
            throw new RuntimeException("Token inválido ou expirado");
        }

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        UserSummaryDTO dto = new UserSummaryDTO();
        dto.id = user.getId().toString();
        dto.name = user.getName();
        dto.email = user.getEmail();
        dto.nickname = user.getNickname();
        dto.score = user.getScore();
        return dto;
    }
}
