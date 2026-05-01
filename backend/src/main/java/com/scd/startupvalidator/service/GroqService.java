package com.scd.startupvalidator.service;

import com.scd.startupvalidator.dto.StartupValidationRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class GroqService {

    private final RestClient restClient;
    private final String apiKey;
    private final String apiUrl;
    private final String model;

    public GroqService(
            RestClient.Builder restClientBuilder,
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.url}") String apiUrl,
            @Value("${groq.model}") String model
    ) {
        this.restClient = restClientBuilder.build();
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
    }

    public String validateStartupIdea(StartupValidationRequest request) {
        GroqChatRequest chatRequest = new GroqChatRequest(
                model,
                List.of(
                        new GroqMessage("system", systemPrompt()),
                        new GroqMessage("user", buildUserPrompt(request))
                ),
                0.4
        );

        GroqChatResponse response = restClient.post()
                .uri(apiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .body(chatRequest)
                .retrieve()
                .body(GroqChatResponse.class);

        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new IllegalStateException("Groq API returned an empty response");
        }

        GroqMessage message = response.choices().get(0).message();
        if (message == null || message.content() == null || message.content().isBlank()) {
            throw new IllegalStateException("Groq API did not return validation feedback");
        }

        return message.content();
    }

    private String systemPrompt() {
        return """
                You are a practical startup advisor. Validate startup ideas clearly for beginners.
                Return concise feedback with these sections:
                1. Market Need
                2. Target Audience Fit
                3. Competition and Differentiation
                4. Revenue Model Review
                5. Risks
                6. Final Verdict
                """;
    }

    private String buildUserPrompt(StartupValidationRequest request) {
        return """
                Validate this startup idea:

                Startup name: %s
                Industry: %s
                Target audience: %s
                Problem statement: %s
                Proposed solution: %s
                Revenue model: %s
                """.formatted(
                request.getStartupName(),
                request.getIndustry(),
                request.getTargetAudience(),
                request.getProblemStatement(),
                request.getProposedSolution(),
                request.getRevenueModel()
        );
    }

    private record GroqChatRequest(String model, List<GroqMessage> messages, double temperature) {
    }

    private record GroqMessage(String role, String content) {
    }

    private record GroqChoice(GroqMessage message) {
    }

    private record GroqChatResponse(List<GroqChoice> choices) {
    }
}
