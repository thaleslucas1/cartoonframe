package com.cartoonframe.app.controller;

import com.cartoonframe.app.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/password-reset")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService service;

    @PostMapping("/request-code")
    public ResponseEntity<?> requestCode(@RequestBody Map<String, String> body) {
        try {
            service.sendResetCode(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "Código enviado para o email"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/confirm-code")
    public ResponseEntity<?> confirmCode(@RequestBody Map<String, String> body) {
        try {
            service.confirmCode(body.get("email"), body.get("code"));
            return ResponseEntity.ok(Map.of("message", "Código confirmado"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            service.resetPassword(body.get("email"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

