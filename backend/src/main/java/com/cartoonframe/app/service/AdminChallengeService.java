package com.cartoonframe.app.service;

import com.cartoonframe.app.dto.ChallengeDTO;
import com.cartoonframe.app.dto.CreateChallengeDTO;
import com.cartoonframe.app.model.Challenge;
import com.cartoonframe.app.repository.ChallengeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdminChallengeService {

    private final ChallengeRepository challengeRepository;

    public AdminChallengeService(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    public ChallengeDTO createChallenge(CreateChallengeDTO dto) {
        LocalDate releaseDate = dto.getReleaseDate();
        String correctAnswer = dto.getCorrectAnswer();
        List<String> imageUrls = dto.getImageUrls();

        if (releaseDate == null) {
            throw new IllegalArgumentException("Data de exibição é obrigatória.");
        }
        if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
            throw new IllegalArgumentException("Resposta correta é obrigatória.");
        }
        if (imageUrls == null || imageUrls.isEmpty()) {
            throw new IllegalArgumentException("Pelo menos uma URL de imagem é obrigatória.");
        }
        if (challengeRepository.findByDate(releaseDate).isPresent()) {
            throw new IllegalArgumentException("Já existe um desafio programado para esta data.");
        }

        Challenge challenge = new Challenge();
        challenge.setDate(releaseDate);
        challenge.setChallengeAnswer(correctAnswer);
        challenge.setFrames(imageUrls);

        Challenge saved = challengeRepository.save(challenge);
        return new ChallengeDTO(saved.getId(), saved.getDate(), saved.getFrames(), 0, false);
    }
}