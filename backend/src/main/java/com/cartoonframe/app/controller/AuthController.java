package com.cartoonframe.app.controller;

import com.cartoonframe.app.dto.LoginRequestDTO;
import com.cartoonframe.app.dto.RegisterRequestDTO;
import com.cartoonframe.app.dto.ResponseDTO;
import com.cartoonframe.app.dto.UserSummaryDTO;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<UserSummaryDTO> register(@RequestBody RegisterRequestDTO dto) {
        return ResponseEntity.ok(authService.register(dto));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserSummaryDTO> profile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getProfile(user));
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyEmail(@RequestParam UUID uuid) {
        authService.verifyEmail(uuid);
        return ResponseEntity.ok().build();
    }
}