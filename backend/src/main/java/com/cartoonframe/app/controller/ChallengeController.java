package com.cartoonframe.app.controller;

import com.cartoonframe.app.dto.ChallengeDTO;
import com.cartoonframe.app.dto.AttemptResultDTO;
import com.cartoonframe.app.dto.GuessDTO;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.service.ChallengeService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

@RestController
@RequestMapping("/api/challenge")
public class ChallengeController {
    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @GetMapping("/today")
    public ResponseEntity<ChallengeDTO> getDailyChallenge(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId
    ) {
        System.out.println("[CHALLENGE] Requisição do desafio diário recebida.");
        System.out.println("[CHALLENGE] Usuário: " + (user != null ? user.getEmail() : "anônimo"));
        System.out.println("[CHALLENGE] Sessão: " + sessionId);

        return ResponseEntity.ok(challengeService.getDailyChallenge(user, sessionId));
    }

    @PostMapping("/try")
    public ResponseEntity<?> guess(
            @RequestBody GuessDTO guessDTO,
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId
    ) {
        System.out.println("[CHALLENGE] Tentativa recebida.");
        System.out.println("[CHALLENGE] Usuário: " + (user != null ? user.getEmail() : "anônimo"));
        System.out.println("[CHALLENGE] Sessão: " + sessionId);

        try {
            AttemptResultDTO result = challengeService.processChallenge(user, sessionId, guessDTO);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/image-proxy")
    public ResponseEntity<byte[]> proxyImage(@RequestParam String url) throws Exception {
        URI uri = new URI(url);
        URL imageUrl = uri.toURL();

        HttpURLConnection connection = (HttpURLConnection) imageUrl.openConnection();
        connection.setRequestProperty("User-Agent", "Mozilla/5.0");
        byte[] bytes = connection.getInputStream().readAllBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(connection.getContentType()));

        return ResponseEntity.ok().headers(headers).body(bytes);
    }

}
