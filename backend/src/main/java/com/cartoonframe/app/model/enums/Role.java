package com.cartoonframe.app.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {

    USER("U"),
    ADMIN("A");

    private final String code;

    private Role(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static Role fromValue(String codigo) {
        return switch (codigo) {
            case "U" -> USER;
            case "A" -> ADMIN;
            default -> null;
        };
    }
}
