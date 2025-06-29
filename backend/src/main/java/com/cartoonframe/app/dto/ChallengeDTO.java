package com.cartoonframe.app.dto;

import java.time.LocalDate;
import java.util.List;

public class ChallengeDTO {
    public LocalDate date;
    public List<String> frames;
    public int remainingGuesses;
    public boolean isCompleted;
    public String challengeAnswer;
}
