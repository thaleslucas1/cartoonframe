package com.cartoonframe.app.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
public class VerifierUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private UUID uuid;

    @Column(nullable = false)
    private Instant expirationDate;

    @ManyToOne
    @JoinColumn(name = "ID_USER", referencedColumnName = "ID", unique = true)
    private User user;

    public long getId() {
        return id;
    }

    public UUID getUuid() {
        return uuid;
    }

    public Instant getExpirationDate() {
        return expirationDate;
    }

    public User getUser() {
        return user;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public void setExpirationDate(Instant expirationDate) {
        this.expirationDate = expirationDate;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
