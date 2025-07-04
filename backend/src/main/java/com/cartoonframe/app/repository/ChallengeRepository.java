package com.cartoonframe.app.repository;

import com.cartoonframe.app.model.Challenge;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    Optional<Challenge> findByDate(LocalDate date);
    List<Challenge> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
}
