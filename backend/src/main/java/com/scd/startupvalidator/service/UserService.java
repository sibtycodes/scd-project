package com.scd.startupvalidator.service;

import com.scd.startupvalidator.dto.ChangePasswordRequest;
import com.scd.startupvalidator.dto.UpdateProfileRequest;
import com.scd.startupvalidator.dto.UserProfileResponse;
import com.scd.startupvalidator.entity.AppUser;
import com.scd.startupvalidator.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfileResponse getProfile() {
        return UserProfileResponse.fromEntity(getLoggedInUser());
    }

    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        AppUser user = getLoggedInUser();
        user.setUsername(request.getUsername().trim());
        AppUser saved = userRepository.save(user);
        return UserProfileResponse.fromEntity(saved);
    }

    public void changePassword(ChangePasswordRequest request) {
        AppUser user = getLoggedInUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private AppUser getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Logged-in user not found"));
    }
}
