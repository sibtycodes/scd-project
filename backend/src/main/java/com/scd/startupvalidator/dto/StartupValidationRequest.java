package com.scd.startupvalidator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StartupValidationRequest {

    @NotBlank(message = "Startup name is required")
    private String startupName;

    @NotBlank(message = "Industry is required")
    private String industry;

    @NotBlank(message = "Target audience is required")
    private String targetAudience;

    @NotBlank(message = "Problem statement is required")
    private String problemStatement;

    @NotBlank(message = "Proposed solution is required")
    private String proposedSolution;

    @NotBlank(message = "Revenue model is required")
    private String revenueModel;
}
