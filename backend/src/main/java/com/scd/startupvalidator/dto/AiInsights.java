package com.scd.startupvalidator.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

public record AiInsights(
        String summary,
        String verdict,
        Scores scores,
        Swot swot,
        List<Risk> risks,
        List<String> assumptions,
        List<String> nextSteps
) {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public static AiInsights fromJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return OBJECT_MAPPER.readValue(json, AiInsights.class);
        } catch (JsonProcessingException ex) {
            return fallback(json);
        }
    }

    public static String toJson(AiInsights insights) {
        if (insights == null) {
            return null;
        }

        try {
            return OBJECT_MAPPER.writeValueAsString(insights);
        } catch (JsonProcessingException ex) {
            return null;
        }
    }

    public static AiInsights fallback(String summary) {
        Scores scores = new Scores(50, 50, 50, 50, 50, 50, 50);
        Swot swot = new Swot(List.of(), List.of(), List.of(), List.of());
        return new AiInsights(summary, "Needs review", scores, swot, List.of(), List.of(), List.of());
    }

    public record Scores(
            Integer overall,
            Integer market,
            Integer execution,
            Integer differentiation,
            Integer financials,
            Integer traction,
            Integer risk
    ) {
    }

    public record Swot(
            List<String> strengths,
            List<String> weaknesses,
            List<String> opportunities,
            List<String> threats
    ) {
    }

    public record Risk(String risk, String severity, String mitigation) {
    }
}
