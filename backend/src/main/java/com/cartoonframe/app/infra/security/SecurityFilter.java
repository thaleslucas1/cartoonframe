package com.cartoonframe.app.infra.security;

import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    TokenService tokenService;

    @Autowired
    UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        System.out.println("URI: " + uri);

        if (uri.startsWith("/auth/login") ||
                uri.startsWith("/auth/register") ||
                uri.startsWith("/auth/verify") ||
                uri.startsWith("/password-reset") ||
                uri.startsWith("/test-send-mail") ||
                uri.startsWith("/h2-console") ||
                uri.startsWith("/api/ranking/weekly")) {
            System.out.println("Pulando autenticação para rota pública: " + uri);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization header: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Sem token ou token mal formatado.");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String login;
        try {
            login = tokenService.validateToken(token);
            System.out.println("Login extraído do token: " + login);

            if (login == null || login.isEmpty()) {
                System.out.println("Token inválido ou expirado");
                filterChain.doFilter(request, response);
                return;
            }
        } catch (Exception e) {
            System.out.println("Erro ao validar token: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        User user = userRepository.findByEmail(login).orElse(null);
        System.out.println("Usuário encontrado: " + (user != null ? user.getEmail() : "NÃO ENCONTRADO"));

        if (user != null) {
            var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
