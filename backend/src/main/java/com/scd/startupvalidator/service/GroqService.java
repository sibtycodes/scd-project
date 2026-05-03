package com.scd.startupvalidator.service;

import com.scd.startupvalidator.dto.AiInsights;
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

        public AiResult validateStartupIdea(StartupValidationRequest request) {
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

        String content = message.content().trim();
        String json = extractJson(content);
        AiInsights insights = AiInsights.fromJson(json);

        if (insights == null || insights.summary() == null || insights.summary().isBlank()) {
            insights = AiInsights.fallback(content);
        }

        String insightsJson = AiInsights.toJson(insights);
        return new AiResult(insights, insightsJson == null ? content : insightsJson);
    }

    private String systemPrompt() {
                return """
                                You are a pragmatic startup evaluator. Return ONLY a valid JSON object.
                                Required schema:
                                {
                                    "summary": "2-3 sentences",
                                    "verdict": "Strong | Moderate | Weak",
                                    "scores": {
                                        "overall": 0-100,
                                        "market": 0-100,
                                        "execution": 0-100,
                                        "differentiation": 0-100,
                                        "financials": 0-100,
                                        "traction": 0-100,
                                        "risk": 0-100
                                    },
                                    "swot": {
                                        "strengths": ["..."],
                                        "weaknesses": ["..."],
                                        "opportunities": ["..."],
                                        "threats": ["..."]
                                    },
                                    "risks": [
                                        {"risk": "...", "severity": "Low|Medium|High", "mitigation": "..."}
                                    ],
                                    "assumptions": ["..."],
                                    "nextSteps": ["..."]
                                }
                                No markdown. No extra keys.
                                """;
    }

    private String buildUserPrompt(StartupValidationRequest request) {
        return """
                Validate this startup idea:

                Startup name: %s
                Industry: %s
                Location: %s
                Stage: %s
                Team size: %s
                Funding stage: %s
                Target audience: %s
                Problem statement: %s
                Proposed solution: %s
                Unique value proposition: %s
                Competitive landscape: %s
                Traction: %s
                Go-to-market: %s
                Revenue model: %s
                Pricing: %s
                Timeline: %s
                """.formatted(
                request.getStartupName(),
                request.getIndustry(),
                request.getLocation(),
                request.getStage(),
                request.getTeamSize(),
                request.getFundingStage(),
                request.getTargetAudience(),
                request.getProblemStatement(),
                request.getProposedSolution(),
                request.getUniqueValueProposition(),
                request.getCompetition(),
                request.getTraction(),
                request.getGoToMarket(),
                request.getRevenueModel(),
                request.getPricing(),
                request.getTimeline()
        );
    }

    private String extractJson(String content) {
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return content.substring(start, end + 1);
        }
        return content;
    }

    public record AiResult(AiInsights insights, String insightsJson) {
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
