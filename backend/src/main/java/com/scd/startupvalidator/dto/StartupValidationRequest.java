package com.scd.startupvalidator.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartupValidationRequest {

    @NotBlank(message = "Startup name is required")
    private String startupName;

    @NotBlank(message = "Industry is required")
    private String industry;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Stage is required")
    private String stage;

    @NotNull(message = "Team size is required")
    @Min(value = 1, message = "Team size must be at least 1")
    @Max(value = 100000, message = "Team size is too large")
    private Integer teamSize;

    @NotBlank(message = "Funding stage is required")
    private String fundingStage;

    @NotBlank(message = "Target audience is required")
    private String targetAudience;

    @NotBlank(message = "Problem statement is required")
    private String problemStatement;

    @NotBlank(message = "Proposed solution is required")
    private String proposedSolution;

    @NotBlank(message = "Unique value proposition is required")
    private String uniqueValueProposition;

    @NotBlank(message = "Competitive landscape is required")
    private String competition;

    @NotBlank(message = "Traction is required")
    private String traction;

    @NotBlank(message = "Go-to-market plan is required")
    private String goToMarket;

    @NotBlank(message = "Revenue model is required")
    private String revenueModel;

    @NotBlank(message = "Pricing strategy is required")
    private String pricing;

    @NotBlank(message = "Timeline is required")
    private String timeline;
}
