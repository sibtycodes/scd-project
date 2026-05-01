package com.scd.startupvalidator.dto;

import com.scd.startupvalidator.entity.StartupValidation;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StartupValidationResponse {

    private Long id;
    private String startupName;
    private String industry;
    private String targetAudience;
    private String problemStatement;
    private String proposedSolution;
    private String revenueModel;
    private String aiFeedback;
    private LocalDateTime createdAt;

    public static StartupValidationResponse fromEntity(StartupValidation validation) {
        return StartupValidationResponse.builder()
                .id(validation.getId())
                .startupName(validation.getStartupName())
                .industry(validation.getIndustry())
                .targetAudience(validation.getTargetAudience())
                .problemStatement(validation.getProblemStatement())
                .proposedSolution(validation.getProposedSolution())
                .revenueModel(validation.getRevenueModel())
                .aiFeedback(validation.getAiFeedback())
                .createdAt(validation.getCreatedAt())
                .build();
    }
}
