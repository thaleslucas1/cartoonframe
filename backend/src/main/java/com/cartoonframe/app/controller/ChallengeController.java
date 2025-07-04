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
import java.time.LocalDate;
import java.util.List;

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

    @GetMapping("/by-date/{date}")
    public ResponseEntity<ChallengeDTO> getChallengeByDate(
            @PathVariable String date,
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId
    ) {
        LocalDate parsedDate = LocalDate.parse(date);
        ChallengeDTO challengeDTO = challengeService.getChallengeByDate(parsedDate, user, sessionId);
        return ResponseEntity.ok(challengeDTO);
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

    @GetMapping("/history")
    public ResponseEntity<List<ChallengeDTO>> getChallengeHistory(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();

        List<ChallengeDTO> challengeHistory = challengeService.getLast7ChallengesForUser(user);
        return ResponseEntity.ok(challengeHistory);
    }
}
