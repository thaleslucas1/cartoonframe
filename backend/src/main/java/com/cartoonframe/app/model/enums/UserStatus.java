package com.cartoonframe.app.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserStatus {

    ACTIVE ("A"),
    INACTIVE ("I"),
    PENDING ("P");

    private String code;

    private UserStatus(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static UserStatus fromValue(String codigo) {
        return switch (codigo) {
            case "A" -> ACTIVE;
            case "I" -> INACTIVE;
            case "P" -> PENDING;
            default -> null;
        };
    }
}
