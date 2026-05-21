package com.cartoonframe.app.dto;

import java.time.LocalDate;
import java.util.List;

public record ChallengeDTO(
        Long id,
        LocalDate date,
        List<String> frames,
        int remainingGuesses,
        boolean isCompleted
) {}