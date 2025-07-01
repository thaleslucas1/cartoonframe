package com.cartoonframe.app.controller;

import com.cartoonframe.app.dto.LoginRequestDTO;
import com.cartoonframe.app.dto.RegisterRequestDTO;
import com.cartoonframe.app.dto.ResponseDTO;
import com.cartoonframe.app.infra.security.TokenService;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository repository;

    private final PasswordEncoder passwordEncoder;

    private final TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginRequestDTO body) {

        User user = this.repository.findByEmail(body.email()).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (passwordEncoder.matches(body.password(), user.getPassword())) {
            String token = this.tokenService.generateToken(user);
            System.out.println("[LOGIN] Login bem-sucedido para: " + user.getEmail());
            System.out.println("[LOGIN] Token gerado: " + token);
            return ResponseEntity.ok(new ResponseDTO(user.getName(), token));
        }
        System.out.println("[LOGIN] Senha incorreta para: " + body.email());
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody RegisterRequestDTO body) {

    @GetMapping("/profile")
    public ResponseEntity<?> profile(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("message", "Token ausente ou mal formatado"));
            }
            String token = authHeader.substring(7);
            UserSummaryDTO profile = authService.getProfile(token);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam UUID uuid) {
        try {
            authService.verifyEmail(uuid);
            return ResponseEntity.ok(Map.of("message", "Conta verificada com sucesso!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
        return ResponseEntity.badRequest().build();
    }

}
