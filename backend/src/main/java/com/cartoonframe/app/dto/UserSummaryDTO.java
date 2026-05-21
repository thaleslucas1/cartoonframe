package com.cartoonframe.app.dto;

import com.cartoonframe.app.model.User;
import com.cartoonframe.app.model.enums.Role;
import com.cartoonframe.app.model.enums.UserStatus;

public record UserSummaryDTO(
        String id,
        String name,
        String email,
        String nickname,
        int score,
        UserStatus userStatus,
        Role role
) {
    public static UserSummaryDTO from(User user) {
        return new UserSummaryDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getNickname(),
                user.getScore(),
                user.getUserStatus(),
                user.getRole()
        );
    }
}
