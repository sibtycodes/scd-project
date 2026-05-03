package com.scd.startupvalidator.service;

import com.scd.startupvalidator.dto.StartupValidationRequest;
import com.scd.startupvalidator.dto.StartupValidationResponse;
import com.scd.startupvalidator.entity.AppUser;
import com.scd.startupvalidator.entity.StartupValidation;
import com.scd.startupvalidator.repository.StartupValidationRepository;
import com.scd.startupvalidator.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StartupValidationService {

    private final StartupValidationRepository validationRepository;
    private final UserRepository userRepository;
    private final GroqService groqService;

    public StartupValidationService(
            StartupValidationRepository validationRepository,
            UserRepository userRepository,
            GroqService groqService
    ) {
        this.validationRepository = validationRepository;
        this.userRepository = userRepository;
        this.groqService = groqService;
    }

    public StartupValidationResponse createValidation(StartupValidationRequest request) {
        AppUser user = getLoggedInUser();
        GroqService.AiResult aiResult = groqService.validateStartupIdea(request);

        StartupValidation validation = StartupValidation.builder()
                .startupName(request.getStartupName())
                .industry(request.getIndustry())
            .location(request.getLocation())
            .stage(request.getStage())
            .teamSize(request.getTeamSize())
            .fundingStage(request.getFundingStage())
                .targetAudience(request.getTargetAudience())
                .problemStatement(request.getProblemStatement())
                .proposedSolution(request.getProposedSolution())
            .uniqueValueProposition(request.getUniqueValueProposition())
            .competition(request.getCompetition())
            .traction(request.getTraction())
            .goToMarket(request.getGoToMarket())
                .revenueModel(request.getRevenueModel())
            .pricing(request.getPricing())
            .timeline(request.getTimeline())
            .aiFeedback(aiResult.insights().summary())
            .aiInsights(aiResult.insightsJson())
                .user(user)
                .build();

        StartupValidation savedValidation = validationRepository.save(validation);
        return StartupValidationResponse.fromEntity(savedValidation);
    }

    public List<StartupValidationResponse> getMyValidations() {
        AppUser user = getLoggedInUser();

        return validationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(StartupValidationResponse::fromEntity)
                .toList();
    }

    public StartupValidationResponse getMyValidationById(Long id) {
        AppUser user = getLoggedInUser();

        StartupValidation validation = validationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Validation not found"));

        return StartupValidationResponse.fromEntity(validation);
    }

    private AppUser getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Logged-in user not found"));
    }
}
