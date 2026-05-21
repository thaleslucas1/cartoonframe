package com.cartoonframe.app.repository;

import com.cartoonframe.app.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByEmailAndCodeAndUsedFalse(String email, String code);
    List<PasswordResetToken> findByEmailAndUsedFalse(String email);
}
