package com.scd.startupvalidator.dto;

import com.scd.startupvalidator.entity.AppUser;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {

    private String username;
    private String email;

    public static UserProfileResponse fromEntity(AppUser user) {
        return new UserProfileResponse(user.getUsername(), user.getEmail());
    }
}
