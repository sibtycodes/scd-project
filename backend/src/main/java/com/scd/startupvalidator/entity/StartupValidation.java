package com.scd.startupvalidator.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "startup_validations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartupValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "startup_name", nullable = false)
    private String startupName;

    @Column(nullable = false)
    private String industry;

    @Column(name = "target_audience", nullable = false, columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "problem_statement", nullable = false, columnDefinition = "TEXT")
    private String problemStatement;

    @Column(name = "proposed_solution", nullable = false, columnDefinition = "TEXT")
    private String proposedSolution;

    @Column(name = "revenue_model", nullable = false, columnDefinition = "TEXT")
    private String revenueModel;

    @Column(name = "ai_feedback", nullable = false, columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
