package com.cartoonframe.app.model;


import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "challenge", uniqueConstraints = {
        @UniqueConstraint(columnNames = "date")
})
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    @Column(name = "challenge_answer")
    private String challengeAnswer;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> frames = new ArrayList<>();

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Guess> guesses = new ArrayList<>();

    public Challenge() {
    }

    public String getChallengeAnswer() {
        return challengeAnswer;
    }

    public long getId() {
        return id;
    }

    public LocalDate getDate() {
        return date;
    }

    public List<String> getFrames() {
        return frames;
    }

    public List<Guess> getGuesses() {
        return guesses;
    }

    public void setGuesses(List<Guess> guesses) {
        this.guesses = guesses;
    }

    public void setFrames(List<String> frames) {
        this.frames = frames;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setChallengeAnswer(String challengeAnswer) {
        this.challengeAnswer = challengeAnswer;
    }
}