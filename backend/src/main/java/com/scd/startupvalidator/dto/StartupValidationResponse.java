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
    private String location;
    private String stage;
    private Integer teamSize;
    private String fundingStage;
    private String targetAudience;
    private String problemStatement;
    private String proposedSolution;
    private String uniqueValueProposition;
    private String competition;
    private String traction;
    private String goToMarket;
    private String revenueModel;
    private String pricing;
    private String timeline;
    private String aiFeedback;
    private AiInsights aiInsights;
    private LocalDateTime createdAt;

    public static StartupValidationResponse fromEntity(StartupValidation validation) {
        AiInsights insights = AiInsights.fromJson(validation.getAiInsights());

        return StartupValidationResponse.builder()
                .id(validation.getId())
                .startupName(validation.getStartupName())
                .industry(validation.getIndustry())
                .location(validation.getLocation())
                .stage(validation.getStage())
                .teamSize(validation.getTeamSize())
                .fundingStage(validation.getFundingStage())
                .targetAudience(validation.getTargetAudience())
                .problemStatement(validation.getProblemStatement())
                .proposedSolution(validation.getProposedSolution())
                .uniqueValueProposition(validation.getUniqueValueProposition())
                .competition(validation.getCompetition())
                .traction(validation.getTraction())
                .goToMarket(validation.getGoToMarket())
                .revenueModel(validation.getRevenueModel())
                .pricing(validation.getPricing())
                .timeline(validation.getTimeline())
                .aiFeedback(validation.getAiFeedback())
                .aiInsights(insights)
                .createdAt(validation.getCreatedAt())
                .build();
    }
}
