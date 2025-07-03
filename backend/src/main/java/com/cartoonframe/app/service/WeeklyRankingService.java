package com.cartoonframe.app.service;

import com.cartoonframe.app.dto.UserRankingDTO;
import com.cartoonframe.app.model.Guess;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.GuessesRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class WeeklyRankingService {

    private final GuessesRepository guessesRepository;

    public WeeklyRankingService(GuessesRepository guessesRepository) {
        this.guessesRepository = guessesRepository;
    }

    public List<UserRankingDTO> getWeeklyRanking() {
        LocalDate startOfWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate endOfWeek = LocalDate.now().with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));

        LocalDateTime startDateTime = startOfWeek.atStartOfDay();
        LocalDateTime endDateTime = endOfWeek.atTime(23, 59, 59);

        List<Guess> weeklyCorrectGuesses = guessesRepository.findByIsCorrectTrueAndCreatedAtBetween(startDateTime, endDateTime);

        Map<User, Integer> userPoints = new HashMap<>();

        for (Guess guess : weeklyCorrectGuesses) {
            User user = guess.getUser();
            if (user == null) continue;

            int guessOrder = guess.getGuessOrder();
            int points = 100 - (guessOrder * 20);
            userPoints.put(user, userPoints.getOrDefault(user, 0) + points);
        }

        List<UserRankingDTO> ranking = new ArrayList<>();
        for (Map.Entry<User, Integer> entry : userPoints.entrySet()) {
            UserRankingDTO dto = new UserRankingDTO();
            dto.nickname = entry.getKey().getNickname();
            dto.points = entry.getValue();
            ranking.add(dto);
        }

        ranking.sort((a, b) -> Integer.compare(b.points, a.points));

        return ranking.size() > 10 ? ranking.subList(0, 10) : ranking;
    }
}

