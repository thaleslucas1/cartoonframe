package com.cartoonframe.app.infra.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.cartoonframe.app.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class TokenService {

    private final Logger logger = LoggerFactory.getLogger(TokenService.class);

    @Value("${api.security.token.secret}")
    private String secret;

    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            String token = JWT.create()
                    .withIssuer("cartoonframe")
                    .withSubject(user.getEmail())
                    .withExpiresAt(this.generateExpirationDate())
                    .sign(algorithm);
            logger.info("Token gerado para usuário: {}", user.getEmail());
            return token;
        } catch (JWTCreationException e) {
            logger.error("Erro ao gerar token para usuário {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Erro enquanto tenta autenticar");
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            String subject = JWT.require(algorithm)
                    .withIssuer("cartoonframe")
                    .build()
                    .verify(token)
                    .getSubject();
            logger.debug("Token válido para usuário: {}", subject);
            return subject;
        } catch (JWTVerificationException e) {
            logger.warn("Token inválido ou expirado: {}", e.getMessage());
            return null;
        }
    }

    private Instant generateExpirationDate() {
        return Instant.now().plusSeconds(2 * 3600);
    }
}
