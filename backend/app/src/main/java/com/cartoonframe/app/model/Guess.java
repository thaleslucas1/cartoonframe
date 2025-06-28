package com.cartoonframe.app.model;

import jakarta.persistence.*;

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

    public long getId() {
        return id;
    }

    public Challenge getDesafio() {
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


    public void setPlayerGuess(String playerGuess) {
        this.playerGuess = playerGuess;
    }

    public void setGuessOrder(int guessOrder) {
        this.guessOrder = guessOrder;
    }

    public void setCorrect(boolean correct) {
        this.isCorrect = correct;
    }

    public void setDesafio(Challenge challenge) {
        this.challenge = challenge;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
