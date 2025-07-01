package com.cartoonframe.app.util;

public class ValidationUtils {

    public static void validateEmail(String email) {
        if (email == null || !email.matches("^[\\w-.]+@[\\w-]+\\.[a-z]{2,}$")) {
            throw new RuntimeException("Email inválido");
        }
    }

    public static void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new RuntimeException("Senha deve ter ao menos 8 caracteres");
        }
    }
}

