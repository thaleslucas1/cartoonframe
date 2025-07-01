package com.cartoonframe.app.dto;

import com.cartoonframe.app.model.enums.UserStatus;

public class UserSummaryDTO {
    public String id;
    public String name;
    public String email;
    public String nickname;
    public int score;
    public UserStatus userStatus;
}
