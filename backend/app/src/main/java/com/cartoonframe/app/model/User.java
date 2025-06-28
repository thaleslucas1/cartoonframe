package com.cartoonframe.app.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "\"user\"")
public class User {

    //atributos

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String email;

    private String password;

    private String name;

    private String nickname;

    private LocalDate registrationDate;

    private int score;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Guess> guesses = new ArrayList<>();

    //construtores

    public User() {
    }

    //getters

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getName() {
        return name;
    }

    public String getNickname() {
        return nickname;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public int getScore() {
        return score;
    }

    public List<Guess> getGuesses() {
        return guesses;
    }

    //setters

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public void setGuesses(List<Guess> guesses) {
        this.guesses = guesses;
    }
}
