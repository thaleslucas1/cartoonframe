package com.cartoonframe.app.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserStatus {

    ACTIVE ("A", "Active"),
    INACTIVE ("I", "Inactive"),
    PENDING ("P", "Pending");

    private String code;
    private String description;

    private UserStatus(String code, String description) {
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
    public static UserStatus fromValue(String codigo) {
        return switch (codigo) {
            case "A" -> ACTIVE;
            case "I" -> INACTIVE;
            case "P" -> PENDING;
            default -> null;
        };
    }
}
