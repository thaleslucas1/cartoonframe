package com.cartoonframe.app.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {

    USER("U", "User"),
    ADMIN("A", "Admin");

    private String code;
    private String description;

    private Role(String code, String description) {
        this.code = code;
        this.description = description;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setDescription(String description) {
        this.description = description;
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
