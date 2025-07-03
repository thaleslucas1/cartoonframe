package com.cartoonframe.app.controller;

import com.cartoonframe.app.dto.CreateChallengeDTO;
import com.cartoonframe.app.model.Challenge;
import com.cartoonframe.app.service.AdminChallengeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/challenges")
@PreAuthorize("hasRole('ADMIN')")
public class AdminChallengeController {

    private final AdminChallengeService adminChallengeService;

    public AdminChallengeController(AdminChallengeService adminChallengeService) {
        this.adminChallengeService = adminChallengeService;
    }

    @PostMapping
    public ResponseEntity<Challenge> create(@RequestBody CreateChallengeDTO dto) {
        Challenge created = adminChallengeService.createChallenge(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}