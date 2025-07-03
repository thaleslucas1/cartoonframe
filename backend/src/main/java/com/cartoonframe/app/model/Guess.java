package com.cartoonframe.app.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Guess {

    //atributos

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String playerGuess;

    private int guessOrder;

    private boolean isCorrect;

    @ManyToOne
    @JoinColumn(name = "challenge_id")
    private Challenge challenge;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id")
    private String sessionId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    //construtores

    public Guess() {
    }

    public Guess(Challenge challenge, boolean isCorrect, int guessOrder, String playerGuess) {
        this.challenge = challenge;
        this.isCorrect = isCorrect;
        this.guessOrder = guessOrder;
        this.playerGuess = playerGuess;
    }

    //getters

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public long getId() {
        return id;
    }

    public Challenge getChallenge() {
        return challenge;
    }

    public boolean isCorrect() {
        return isCorrect;
    }

    public int getGuessOrder() {
        return guessOrder;
    }

    public String getPlayerGuess() {
        return playerGuess;
    }

    public User getUser() {
        return user;
    }

    public String getSessionId() {
        return sessionId;
    }

    //setters

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setPlayerGuess(String playerGuess) {
        this.playerGuess = playerGuess;
    }

    public void setGuessOrder(int guessOrder) {
        this.guessOrder = guessOrder;
    }

    public void setCorrect(boolean correct) {
        this.isCorrect = correct;
    }

    public void setChallenge(Challenge challenge) {
        this.challenge = challenge;
    }
    public void setUser(User user) {
        this.user = user;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
