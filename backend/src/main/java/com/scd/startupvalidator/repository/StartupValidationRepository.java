package com.scd.startupvalidator.repository;

import com.scd.startupvalidator.entity.AppUser;
import com.scd.startupvalidator.entity.StartupValidation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StartupValidationRepository extends JpaRepository<StartupValidation, Long> {

    List<StartupValidation> findByUserOrderByCreatedAtDesc(AppUser user);

    Optional<StartupValidation> findByIdAndUser(Long id, AppUser user);
}
