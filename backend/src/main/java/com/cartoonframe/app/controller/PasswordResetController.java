package com.cartoonframe.app.controller;

import com.cartoonframe.app.dto.PasswordResetConfirmDTO;
import com.cartoonframe.app.dto.PasswordResetDTO;
import com.cartoonframe.app.dto.PasswordResetRequestDTO;
import com.cartoonframe.app.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/password-reset")
public class PasswordResetController {

    private final PasswordResetService service;

    public PasswordResetController(PasswordResetService service) {
        this.service = service;
    }

    @PostMapping("/request-code")
    public ResponseEntity<Void> requestCode(@RequestBody PasswordResetRequestDTO dto) {
        service.sendResetCode(dto.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm-code")
    public ResponseEntity<Void> confirmCode(@RequestBody PasswordResetConfirmDTO dto) {
        service.confirmCode(dto.email(), dto.code());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody PasswordResetDTO dto) {
        service.resetPassword(dto.email(), dto.newPassword());
        return ResponseEntity.ok().build();
    }
}

