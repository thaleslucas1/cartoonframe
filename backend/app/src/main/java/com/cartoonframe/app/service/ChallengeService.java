package com.cartoonframe.app.service;

import com.cartoonframe.app.dto.ChallengeDTO;
import com.cartoonframe.app.dto.AttemptResultDTO;
import com.cartoonframe.app.dto.GuessDTO;
import com.cartoonframe.app.dto.UserSummaryDTO;
import com.cartoonframe.app.model.Challenge;
import com.cartoonframe.app.model.Guess;
import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.ChallengeRepository;
import com.cartoonframe.app.repository.GuessesRepository;
import com.cartoonframe.app.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ChallengeService {

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
                .orElseThrow(() -> new RuntimeException("Desafio de hoje não foi encontrado"));

        List<Guess> userGuesses = challenge.getGuesses().stream()
                .filter(g -> {
                    if (user != null) {
                        return g.getUser() != null && g.getUser().getId().equals(user.getId());
                    } else {
                        return g.getUser() == null
                                && g.getSessionId() != null
                                && !g.getSessionId().isBlank()
                                && g.getSessionId().equals(sessionId);
                    }
                })
                .toList();

        int remainingGuesses = 5 - userGuesses.size();

        ChallengeDTO dto = new ChallengeDTO();
        dto.date = challenge.getDate();
        dto.frames = challenge.getFrames().subList(0, Math.min(1, challenge.getFrames().size()));
        dto.remainingGuesses = remainingGuesses;

        return dto;
    }

    @Transactional
    public AttemptResultDTO processChallenge(User user, String sessionId, GuessDTO guessDTO) {
        System.out.println("Usuário autenticado? " + (user != null ? user.getEmail() : "NÃO"));
        System.out.println("Session ID recebido: " + (sessionId != null ? sessionId : "NENHUM"));

        Challenge challenge = challengeRepository.findByDate(LocalDate.now())
                .orElseThrow(() -> new RuntimeException("Desafio de hoje não foi encontrado"));

        List<Guess> userGuesses = challenge.getGuesses().stream()
                .filter(g -> {
                    if (user != null) {
                        return g.getUser() != null && g.getUser().getId().equals(user.getId());
                    } else {
                        return g.getUser() == null
                                && g.getSessionId() != null
                                && !g.getSessionId().isBlank()
                                && g.getSessionId().equals(sessionId);
                    }
                })
                .toList();

        System.out.println("Palpites anteriores encontrados: " + userGuesses.size());

        boolean hasCompleted = userGuesses.stream().anyMatch(Guess::isCorrect);

        if (hasCompleted) {
            throw new RuntimeException("Você já completou esse desafio.");
        }

        int totalGuesses = userGuesses.size();

        if (totalGuesses >= 5) {
            throw new RuntimeException("Número máximo de tentativas atingido.");
        }

        boolean isCorrect = challenge.getChallengeAnswer().equalsIgnoreCase(guessDTO.guess);

        Guess guess = new Guess();
        guess.setPlayerGuess(guessDTO.guess);
        guess.setGuessOrder(totalGuesses);
        guess.setCorrect(isCorrect);
        guess.setDesafio(challenge);

        System.out.println("Tentativa recebida: " + guessDTO.guess);
        System.out.println("Ordem da tentativa: " + totalGuesses);
        System.out.println("É correta? " + isCorrect);

        if (user != null) {
            guess.setUser(user);
            System.out.println("Tentativa associada ao usuário: " + user.getEmail());
        } else if (sessionId != null && !sessionId.isBlank()) {
            guess.setSessionId(sessionId);
            System.out.println("Tentativa associada à sessionId: " + sessionId);
        } else {
            System.out.println("ERRO: Tentativa sem usuário e sem sessionId.");
            throw new RuntimeException("Usuário não autenticado e sessionId ausente.");
        }

        guessesRepository.save(guess);

        totalGuesses++;

        System.out.println("Tentativa salva com sucesso.");
        System.out.println("Tentativas totais após salvar: " + (totalGuesses));
        System.out.println("Tentativas restantes " + (5 - totalGuesses));

        AttemptResultDTO result = new AttemptResultDTO();
        result.isCorrect = isCorrect;
        result.order = totalGuesses - 1;
        int frameIndex = Math.min(result.order, challenge.getFrames().size() - 1);
        result.currentFrame = challenge.getFrames().get(frameIndex);
        result.remainingGuesses = 5 - totalGuesses;
        result.challengeAnswer = (isCorrect || totalGuesses == 5) ? challenge.getChallengeAnswer() : null;

        if (user != null) {
            UserSummaryDTO dto = new UserSummaryDTO();
            if (isCorrect || totalGuesses == 5) {
                dto.score = (result.remainingGuesses + 1) * 25;
            }
            dto.id = user.getId();
            dto.name = user.getName();
            dto.email = user.getEmail();
            result.user = dto;
        }
        return result;
    }
}
