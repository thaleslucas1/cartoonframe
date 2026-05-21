package com.cartoonframe.app.util;

public class ValidationUtils {

    public static void validateEmail(String email) {
        if (email == null || !email.matches("^[\\w+.%-]+@[\\w.-]+\\.[a-zA-Z]{2,}$")) {
            throw new IllegalArgumentException("Email inválido");
        }
    }

    public static void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Senha deve ter ao menos 8 caracteres");
        }
    }
}