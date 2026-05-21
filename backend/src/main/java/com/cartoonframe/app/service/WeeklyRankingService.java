package com.cartoonframe.app.service;

import com.cartoonframe.app.dto.UserRankingDTO;
import com.cartoonframe.app.model.Guess;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.GuessesRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WeeklyRankingService {

    private final GuessesRepository guessesRepository;

    public WeeklyRankingService(GuessesRepository guessesRepository) {
        this.guessesRepository = guessesRepository;
    }

    public List<UserRankingDTO> getWeeklyRanking() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(23, 59, 59);

        List<Guess> weeklyCorrectGuesses = guessesRepository
                .findByIsCorrectTrueAndCreatedAtBetween(start, end);

        return weeklyCorrectGuesses.stream()
                .filter(g -> g.getUser() != null)
                .collect(Collectors.groupingBy(
                        Guess::getUser,
                        Collectors.summingInt(g -> 100 - (g.getGuessOrder() * 20))
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<User, Integer>comparingByValue().reversed())
                .limit(10)
                .map(e -> new UserRankingDTO(e.getKey().getNickname(), e.getValue()))
                .toList();
    }
}

