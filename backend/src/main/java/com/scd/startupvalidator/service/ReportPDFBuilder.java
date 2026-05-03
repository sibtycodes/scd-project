package com.scd.startupvalidator.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scd.startupvalidator.entity.StartupValidation;
import com.scd.startupvalidator.exception.ReportGenerationException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class ReportPDFBuilder {

    private static final float PAGE_WIDTH = 595.28f;
    private static final float PAGE_HEIGHT = 841.89f;
    private static final float MARGIN_X = 44;
    private static final float MARGIN_TOP = 44;
    private static final float MARGIN_BOTTOM = 44;
    private static final float CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_X * 2);

    private final ObjectMapper objectMapper = new ObjectMapper();

    public byte[] generatePDF(StartupValidation validation)
            throws ReportGenerationException {

        try {

            Map<String, Object> insights = objectMapper.readValue(
                    validation.getAiInsights(),
                    new TypeReference<Map<String, Object>>() {
                    });

            PDDocument document = new PDDocument();

            PDPage coverPage = new PDPage();
            document.addPage(coverPage);

            addCoverPage(document, coverPage, validation);

            PDPage tocPage = addNewPage(document);
            addTableOfContents(document, tocPage);

            PDPage overviewPage = addNewPage(document);
            addStartupOverviewSection(
                    document,
                    overviewPage,
                    validation);

            PDPage businessPage = addNewPage(document);
            addBusinessDetailsSection(
                    document,
                    businessPage,
                    validation);

            PDPage aiPage = addNewPage(document);
            addAISummarySection(
                    document,
                    aiPage,
                    validation,
                    insights);

            PDPage swotPage = addNewPage(document);
            addSWOTSection(
                    document,
                    swotPage,
                    insights);

            PDPage riskPage = addNewPage(document);
            addRiskSection(
                    document,
                    riskPage,
                    insights);

            PDPage assumptionsPage = addNewPage(document);
            addAssumptionsSection(
                    document,
                    assumptionsPage,
                    insights);

            PDPage nextStepsPage = addNewPage(document);
            addNextStepsSection(
                    document,
                    nextStepsPage,
                    insights);

            ByteArrayOutputStream output = new ByteArrayOutputStream();

            document.save(output);
            document.close();

            return output.toByteArray();

        } catch (Exception e) {
            throw new ReportGenerationException(
                    "Failed to generate PDF report",
                    e);
        }
    }

    private void addCoverPage(
            PDDocument document,
            PDPage page,
            StartupValidation validation) throws IOException {

        PDPageContentStream stream = new PDPageContentStream(document, page);

        stream.beginText();
        stream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA_BOLD),
                34);
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - 180);
        stream.showText("Startup Validation Report");
        stream.endText();

        stream.beginText();
        stream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA),
                22);
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - 260);
        stream.showText(validation.getStartupName());
        stream.endText();

        stream.beginText();
        stream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA),
                14);
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - 310);
        stream.showText("Industry: " + validation.getIndustry());
        stream.endText();

        stream.beginText();
        stream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA),
                12);
        stream.newLineAtOffset(MARGIN_X, 80);
        stream.showText(
                "Generated: "
                        + LocalDateTime.now().format(
                                DateTimeFormatter.ofPattern(
                                        "MMMM dd, yyyy HH:mm")));
        stream.endText();

        stream.close();
    }

    private void addTableOfContents(
            PDDocument document,
            PDPage page) throws IOException {

        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Table of Contents");

        float y = PAGE_HEIGHT - 120;

        String[] sections = {
                "1. Startup Overview",
                "2. Business Details",
                "3. AI Validation Summary",
                "4. SWOT Analysis",
                "5. Risk Analysis",
                "6. Assumptions",
                "7. Recommended Next Steps"
        };

        stream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA),
                12);

        for (String section : sections) {

            stream.beginText();
            stream.newLineAtOffset(MARGIN_X, y);
            stream.showText(section);
            stream.endText();

            y -= 28;
        }

        stream.close();
    }

    private void addStartupOverviewSection(
            PDDocument document,
            PDPage page,
            StartupValidation validation) throws IOException {

        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Startup Overview");

        float y = PAGE_HEIGHT -110;

        y = addWrappedText(
                stream,
                "Industry: " + validation.getIndustry(),
                y);

        y = addWrappedText(
                stream,
                "Location: " + validation.getLocation(),
                y);

        y = addWrappedText(
                stream,
                "Problem Statement: "
                        + validation.getProblemStatement(),
                y);

        y = addWrappedText(
                stream,
                "Proposed Solution: "
                        + validation.getProposedSolution(),
                y);

        y = addWrappedText(
                stream,
                "Target Audience: "
                        + validation.getTargetAudience(),
                y);

        y = addWrappedText(
                stream,
                "Unique Value Proposition: "
                        + validation.getUniqueValueProposition(),
                y);

        stream.close();
    }

    private void addBusinessDetailsSection(
            PDDocument document,
            PDPage page,
            StartupValidation validation) throws IOException {

        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Business Details");

        float y = PAGE_HEIGHT -110;

        y = addWrappedText(
                stream,
                "Stage: " + validation.getStage(),
                y);

        y = addWrappedText(
                stream,
                "Team Size: " + validation.getTeamSize(),
                y);

        y = addWrappedText(
                stream,
                "Funding Stage: "
                        + validation.getFundingStage(),
                y);

        y = addWrappedText(
                stream,
                "Revenue Model: "
                        + validation.getRevenueModel(),
                y);

        y = addWrappedText(
                stream,
                "Pricing: "
                        + validation.getPricing(),
                y);

        y = addWrappedText(
                stream,
                "Timeline: "
                        + validation.getTimeline(),
                y);

        y = addWrappedText(
                stream,
                "Traction: "
                        + validation.getTraction(),
                y);

        y = addWrappedText(
                stream,
                "Go To Market: "
                        + validation.getGoToMarket(),
                y);

        stream.close();
    }

    private void addAISummarySection(
            PDDocument document,
            PDPage page,
            StartupValidation validation,
            Map<String, Object> insights) throws IOException {

        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "AI Validation Summary");

        float y = PAGE_HEIGHT -110;

        y = addWrappedText(
                stream,
                "AI Feedback: "
                        + validation.getAiFeedback(),
                y);

        y = addWrappedText(
                stream,
                "Summary: "
                        + extractText(insights, "summary"),
                y);

        y = addWrappedText(
                stream,
                "Verdict: "
                        + extractText(insights, "verdict"),
                y);

        Map<String, Object> scores = (Map<String, Object>) insights.get("scores");

        if (scores != null) {

            y = addWrappedText(
                    stream,
                    "Overall Score: "
                            + scores.get("overall"),
                    y);

            y = addWrappedText(
                    stream,
                    "Market Score: "
                            + scores.get("market"),
                    y);

            y = addWrappedText(
                    stream,
                    "Execution Score: "
                            + scores.get("execution"),
                    y);

            y = addWrappedText(
                    stream,
                    "Differentiation Score: "
                            + scores.get("differentiation"),
                    y);

            y = addWrappedText(
                    stream,
                    "Financial Score: "
                            + scores.get("financials"),
                    y);

            y = addWrappedText(
                    stream,
                    "Traction Score: "
                            + scores.get("traction"),
                    y);

            y = addWrappedText(
                    stream,
                    "Risk Score: "
                            + scores.get("risk"),
                    y);
        }

        stream.close();
    }

    private void addSWOTSection(
            PDDocument document,
            PDPage page,
            Map<String, Object> insights) throws IOException {

        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "SWOT Analysis");

        float y = PAGE_HEIGHT -110;

        Map<String, Object> swot = (Map<String, Object>) insights.get("swot");

        if (swot != null) {

            y = addListSection(
                    stream,
                    "Strengths",
                    (List<String>) swot.get("strengths"),
                    y);

            y = addListSection(
                    stream,
                    "Weaknesses",
                    (List<String>) swot.get("weaknesses"),
                    y);

            y = addListSection(
                    stream,
                    "Opportunities",
                    (List<String>) swot.get("opportunities"),
                    y);

            y = addListSection(
                    stream,
                    "Threats",
                    (List<String>) swot.get("threats"),
                    y);
        }

        stream.close();
    }

    private void addRiskSection(
            PDDocument document,
            PDPage page,
            Map<String, Object> insights) throws IOException {

        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Risk Analysis");

        float y = PAGE_HEIGHT -110;

        List<Map<String, Object>> risks = (List<Map<String, Object>>) insights.get("risks");

        if (risks != null) {

            for (Map<String, Object> risk : risks) {

                y = addWrappedText(
                        stream,
                        "Risk: " + risk.get("risk"),
                        y);

                y = addWrappedText(
                        stream,
                        "Severity: "
                                + risk.get("severity"),
                        y);

                y = addWrappedText(
                        stream,
                        "Mitigation: "
                                + risk.get("mitigation"),
                        y);

                y -= 10;
            }
        }

        stream.close();
    }

    private void addAssumptionsSection(
            PDDocument document,
            PDPage page,
            Map<String, Object> insights) throws IOException {

        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Assumptions");

        float y = PAGE_HEIGHT -110;

        List<String> assumptions = (List<String>) insights.get("assumptions");

        y = addListSection(
                stream,
                "Key Assumptions",
                assumptions,
                y);

        stream.close();
    }

    private void addNextStepsSection(
            PDDocument document,
            PDPage page,
            Map<String, Object> insights) throws IOException {

        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Recommended Next Steps");

        float y = PAGE_HEIGHT -110;

        List<String> nextSteps = (List<String>) insights.get("nextSteps");

        y = addListSection(
                stream,
                "Next Steps",
                nextSteps,
                y);

        stream.close();
    }

    private void addSectionHeader(PDPageContentStream stream, String title) throws IOException {

        stream.setFont(
                new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD),
                18);

        stream.beginText();
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - 50);
        stream.showText(title);
        stream.endText();

        stream.setLineWidth(1f);
        stream.moveTo(MARGIN_X, PAGE_HEIGHT - 65);
        stream.lineTo(PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 65);
        stream.stroke();
    }

    private float addWrappedText(
            PDPageContentStream stream,
            String text,
            float y) throws IOException {

        List<String> lines = wrapText(text, CONTENT_WIDTH, 11);

        stream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA),
                11);

        for (String line : lines) {

            stream.beginText();
            stream.newLineAtOffset(MARGIN_X, y);
            stream.showText(line);
            stream.endText();

            y -= 16;
        }

        return y - 10;
    }

    private float addListSection(
            PDPageContentStream stream,
            String title,
            List<String> items,
            float y) throws IOException {

        if (items == null) {
            return y;
        }

        y = addWrappedText(
                stream,
                title + ":",
                y);

        for (String item : items) {

            y = addWrappedText(
                    stream,
                    "- " + item,
                    y);
        }

        return y;
    }

    private List<String> wrapText(
            String text,
            float maxWidth,
            float fontSize) {

        List<String> lines = new ArrayList<>();

        if (text == null) {
            return lines;
        }

        String[] words = text.split(" ");

        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {

            String testLine = currentLine + " " + word;

            float estimatedWidth = testLine.length() * fontSize * 0.5f;

            if (estimatedWidth > maxWidth) {

                lines.add(currentLine.toString());
                currentLine = new StringBuilder(word);

            } else {

                if (currentLine.length() == 0) {
                    currentLine.append(word);
                } else {
                    currentLine.append(" ").append(word);
                }
            }
        }

        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }

        return lines;
    }

    private PDPage addNewPage(
            PDDocument document) {

        PDPage page = new PDPage();
        document.addPage(page);

        return page;
    }

    private String extractText(
            Map<String, Object> map,
            String key) {

        if (map == null || key == null) {
            return "N/A";
        }

        Object value = map.get(key);

        return value != null
                ? value.toString()
                : "N/A";
    }
}