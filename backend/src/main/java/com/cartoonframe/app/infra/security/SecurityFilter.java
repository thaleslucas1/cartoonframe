package com.cartoonframe.app.infra.security;

import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final Logger logger = LoggerFactory.getLogger(SecurityFilter.class);

    private final TokenService tokenService;

    private final UserRepository userRepository;

    public SecurityFilter(UserRepository userRepository, TokenService tokenService) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        logger.debug("Requisição recebida: {}", uri);

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("Sem token para rota: {}", uri);
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String login;
        try {
            login = tokenService.validateToken(token);
            if (login == null || login.isEmpty()) {
                logger.warn("Token inválido ou expirado para rota: {}", uri);
                filterChain.doFilter(request, response);
                return;
            }
            logger.debug("Token válido para usuário: {}", login);
        } catch (Exception e) {
            logger.error("Erro ao validar token: {}", e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        User user = userRepository.findByEmail(login).orElse(null);
        if (user != null) {
            logger.debug("Usuário autenticado: {}", user.getEmail());
            var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            logger.warn("Usuário não encontrado para o login: {}", login);
        }

        filterChain.doFilter(request, response);
    }
}
