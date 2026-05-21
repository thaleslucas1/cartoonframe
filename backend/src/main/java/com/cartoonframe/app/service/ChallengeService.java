package com.cartoonframe.app.service;

import com.cartoonframe.app.dto.AttemptResultDTO;
import com.cartoonframe.app.dto.ChallengeDTO;
import com.cartoonframe.app.dto.UserSummaryDTO;
import com.cartoonframe.app.model.Challenge;
import com.cartoonframe.app.model.Guess;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.ChallengeRepository;
import com.cartoonframe.app.repository.GuessesRepository;
import com.cartoonframe.app.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class ChallengeService {

    private final Logger logger = LoggerFactory.getLogger(ChallengeService.class);

    private final ChallengeRepository challengeRepository;
    private final GuessesRepository guessesRepository;
    private final UserRepository userRepository;

    public ChallengeService(
            ChallengeRepository challengeRepository,
            GuessesRepository guessesRepository,
            UserRepository userRepository
    ) {
        this.challengeRepository = challengeRepository;
        this.guessesRepository = guessesRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ChallengeDTO getDailyChallenge(User user, String sessionId) {
        Challenge challenge = challengeRepository.findByDate(LocalDate.now())
                .orElseThrow(() -> new IllegalStateException("Desafio de hoje não foi encontrado"));
        return buildChallengeDTO(challenge, user, sessionId);
    }

    @Transactional
    public ChallengeDTO getChallengeByDate(LocalDate date, User user, String sessionId) {
        Challenge challenge = challengeRepository.findByDate(date)
                .orElseThrow(() -> new IllegalStateException("Desafio não encontrado para a data: " + date));
        return buildChallengeDTO(challenge, user, sessionId);
    }

    @Transactional
    public AttemptResultDTO processChallenge(User user, String sessionId, String guess, Long challengeId) {
        logger.info("Processando tentativa. Usuário: {}", user != null ? user.getEmail() : "anônimo");

        if (user == null && (sessionId == null || sessionId.isBlank())) {
            throw new IllegalArgumentException("Usuário não autenticado e sessionId ausente.");
        }

        Challenge challenge = challengeId != null
                ? challengeRepository.findById(challengeId)
                  .orElseThrow(() -> new IllegalStateException("Desafio não encontrado para o ID: " + challengeId))
                : challengeRepository.findByDate(LocalDate.now())
                  .orElseThrow(() -> new IllegalStateException("Desafio de hoje não foi encontrado"));

        List<Guess> userGuesses = filterGuesses(challenge, user, sessionId);

        boolean hasCompleted = userGuesses.stream().anyMatch(Guess::isCorrect) || userGuesses.size() >= 5;
        if (hasCompleted) {
            throw new IllegalStateException("Você já completou esse desafio.");
        }

        int totalGuesses = userGuesses.size();
        boolean isCorrect = challenge.getChallengeAnswer().equalsIgnoreCase(guess);

        Guess newGuess = new Guess();
        newGuess.setPlayerGuess(guess);
        newGuess.setGuessOrder(totalGuesses);
        newGuess.setCorrect(isCorrect);
        newGuess.setChallenge(challenge);
        newGuess.setCreatedAt(LocalDateTime.now());

        if (user != null) {
            newGuess.setUser(user);
        } else {
            newGuess.setSessionId(sessionId);
        }

        guessesRepository.save(newGuess);
        logger.info("Tentativa salva. Correta: {}, Ordem: {}", isCorrect, totalGuesses);

        totalGuesses++;

        int frameIndex = isCorrect
                ? Math.min(totalGuesses - 1, challenge.getFrames().size() - 1)
                : Math.min(totalGuesses, challenge.getFrames().size() - 1);

        int remainingGuesses = 5 - totalGuesses;
        boolean finished = isCorrect || totalGuesses >= 5;
        String challengeAnswer = finished ? challenge.getChallengeAnswer() : null;

        UserSummaryDTO userSummary = null;
        if (user != null) {
            if (isCorrect) {
                int score = 100 - (totalGuesses - 1) * 20;
                user.setScore(user.getScore() + score);
                userRepository.save(user);
            }
            userSummary = UserSummaryDTO.from(user);
        }

        return new AttemptResultDTO(
                isCorrect,
                totalGuesses - 1,
                challenge.getFrames().get(frameIndex),
                remainingGuesses,
                challengeAnswer,
                userSummary,
                challenge.getFrames().subList(0, frameIndex + 1)
        );
    }

    @Transactional
    public List<ChallengeDTO> getLast7ChallengesForUser(User user) {
        LocalDate today = LocalDate.now();
        List<Challenge> challenges = challengeRepository
                .findByDateBetweenOrderByDateAsc(today.minusDays(6), today);

        return challenges.stream()
                .map(challenge -> {
                    List<Guess> userGuesses = challenge.getGuesses().stream()
                            .filter(g -> g.getUser() != null && g.getUser().getId().equals(user.getId()))
                            .toList();

                    return new ChallengeDTO(
                            challenge.getId(),
                            challenge.getDate(),
                            List.of(),
                            5 - userGuesses.size(),
                            userGuesses.stream().anyMatch(Guess::isCorrect)
                    );
                })
                .toList();
    }

    private ChallengeDTO buildChallengeDTO(Challenge challenge, User user, String sessionId) {
        List<Guess> userGuesses = filterGuesses(challenge, user, sessionId);

        int totalGuesses = userGuesses.size();
        boolean completed = userGuesses.stream().anyMatch(Guess::isCorrect) || totalGuesses >= 5;

        int frameCountToShow;
        if (completed) {
            int correctGuessIndex = userGuesses.stream()
                    .filter(Guess::isCorrect)
                    .findFirst()
                    .map(Guess::getGuessOrder)
                    .orElse(totalGuesses - 1);
            frameCountToShow = Math.min(correctGuessIndex + 1, challenge.getFrames().size());
        } else {
            frameCountToShow = Math.min(totalGuesses + 1, challenge.getFrames().size());
        }

        String challengeAnswer = completed ? challenge.getChallengeAnswer() : null;

        return new ChallengeDTO(
                challenge.getId(),
                challenge.getDate(),
                challenge.getFrames().subList(0, frameCountToShow),
                5 - totalGuesses,
                completed
        );
    }

    private List<Guess> filterGuesses(Challenge challenge, User user, String sessionId) {
        return challenge.getGuesses().stream()
                .filter(g -> {
                    if (user != null) {
                        return g.getUser() != null && g.getUser().getId().equals(user.getId());
                    }
                    return g.getUser() == null
                            && g.getSessionId() != null
                            && !g.getSessionId().isBlank()
                            && g.getSessionId().equals(sessionId);
                })
                .sorted(Comparator.comparingInt(Guess::getGuessOrder))
                .toList();
    }
}