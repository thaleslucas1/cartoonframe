package com.cartoonframe.app.repository;

import com.cartoonframe.app.model.VerifierUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface VerifierUserRepository extends JpaRepository<VerifierUser, Long> {
    Optional<VerifierUser> findByUuid(UUID uuid);
}
