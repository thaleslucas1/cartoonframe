package com.cartoonframe.app.dto;

import java.util.List;

public record AttemptResultDTO(
        boolean isCorrect,
        int order,
        String currentFrame,
        int remainingGuesses,
        String challengeAnswer,
        UserSummaryDTO user,
        List<String> frames
) {}
