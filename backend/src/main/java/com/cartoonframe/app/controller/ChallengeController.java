package com.cartoonframe.app.controller;

import com.cartoonframe.app.dto.AttemptResultDTO;
import com.cartoonframe.app.dto.ChallengeDTO;
import com.cartoonframe.app.dto.GuessDTO;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.service.ChallengeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/challenge")
public class ChallengeController {

    private final Logger logger = LoggerFactory.getLogger(ChallengeController.class);
    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @GetMapping("/today")
    public ResponseEntity<ChallengeDTO> getDailyChallenge(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId
    ) {
        logger.info("Desafio diário requisitado. Usuário: {}", user != null ? user.getEmail() : "anônimo");
        return ResponseEntity.ok(challengeService.getDailyChallenge(user, sessionId));
    }

    @GetMapping("/by-date/{date}")
    public ResponseEntity<ChallengeDTO> getChallengeByDate(
            @PathVariable String date,
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId
    ) {
        LocalDate parsedDate = LocalDate.parse(date);
        return ResponseEntity.ok(challengeService.getChallengeByDate(parsedDate, user, sessionId));
    }

    @PostMapping("/try")
    public ResponseEntity<AttemptResultDTO> guess(
            @RequestBody GuessDTO guessDTO,
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId
    ) {
        logger.info("Tentativa recebida. Usuário: {}", user != null ? user.getEmail() : "anônimo");
        AttemptResultDTO result = challengeService.processChallenge(user, sessionId, guessDTO.guess(), guessDTO.challengeId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChallengeDTO>> getChallengeHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(challengeService.getLast7ChallengesForUser(user));
    }
}