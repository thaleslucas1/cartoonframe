package com.cartoonframe.app.infra.security;

import com.cartoonframe.app.model.User;
import com.cartoonframe.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(String nomeUsuario) throws UsernameNotFoundException {
        User user = this.repository.findByEmail(nomeUsuario).orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        /// modificar quando adicionar os roles
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), List.of(authority));
    }
}
