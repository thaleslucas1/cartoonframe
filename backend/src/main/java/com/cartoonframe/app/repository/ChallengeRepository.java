package com.cartoonframe.app.repository;

import com.cartoonframe.app.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    Optional<Challenge> findByDate(LocalDate date);
    List<Challenge> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
}
