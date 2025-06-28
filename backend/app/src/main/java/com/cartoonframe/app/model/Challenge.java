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

    //atributos

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private LocalDate date;

    @Column(name = "challenge_answer")
    private String challengeAnswer;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> frames = new ArrayList<>();


    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Guess> guesses = new ArrayList<>();

    //construtores

    public Challenge() {
    }

    public Challenge(LocalDate date, List<Guess> guesses, List<String> frames) {
        this.date = date;
        this.guesses = guesses;
        this.frames = frames;
    }

    //getters


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

    //setters

    public void setGuesses(List<Guess> guesses) {
        this.guesses = guesses;
    }

    public void setFrames(List<String> frames) {
        this.frames = frames;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }


}