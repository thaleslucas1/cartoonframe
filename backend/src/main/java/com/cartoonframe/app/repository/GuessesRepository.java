package com.cartoonframe.app.repository;

import com.cartoonframe.app.model.Guess;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface GuessesRepository extends JpaRepository<Guess, Long> {
    List<Guess> findByChallenge_Id(long challengeid);
    List<Guess> findByIsCorrectTrueAndCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
