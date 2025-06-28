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

        Optional<User> user = this.repository.findByEmail(body.email());

        if (user.isEmpty()) {
            User newUser = new User();
            newUser.setPassword(passwordEncoder.encode(body.password()));
            newUser.setEmail(body.email());
            newUser.setName(body.name());
            this.repository.save(newUser);

            String token = this.tokenService.generateToken(newUser);

            System.out.println("[REGISTER] Novo usuário registrado: " + newUser.getEmail());
            System.out.println("[REGISTER] Token gerado: " + token);

            return ResponseEntity.ok(new ResponseDTO(newUser.getName(), token));
        }
        return ResponseEntity.badRequest().build();
    }

}
