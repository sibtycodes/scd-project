package com.scd.startupvalidator.repository;

import com.scd.startupvalidator.entity.AppUser;
import com.scd.startupvalidator.entity.Report;
import com.scd.startupvalidator.entity.StartupValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    Optional<Report> findByValidation(StartupValidation validation);

    Optional<Report> findByValidationAndUser(StartupValidation validation, AppUser user);

    Optional<Report> findByIdAndUser(Long id, AppUser user);

    List<Report> findByUserOrderByGeneratedAtDesc(AppUser user);

    List<Report> findByValidationUser(AppUser user);

    boolean existsByValidation(StartupValidation validation);
}
