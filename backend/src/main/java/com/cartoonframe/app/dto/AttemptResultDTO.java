package com.cartoonframe.app.dto;

import com.cartoonframe.app.model.User;

import java.util.List;

public class AttemptResultDTO {
    public boolean isCorrect;
    public int order;
    public String currentFrame;
    public int remainingGuesses;
    public String challengeAnswer;
    public UserSummaryDTO user;
    public List<String> frames;
}
