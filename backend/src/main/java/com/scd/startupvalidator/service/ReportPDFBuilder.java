package com.scd.startupvalidator.service;

import com.scd.startupvalidator.exception.ReportGenerationException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
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

    /**
     * Generates a PDF report from AI insights data
     * @param startupName Name of the startup being validated
     * @param aiInsights Map containing AI analysis data
     * @return byte array of PDF document
     * @throws ReportGenerationException if PDF generation fails
     */
    public byte[] generatePDF(String startupName, Map<String, Object> aiInsights) throws ReportGenerationException {
        try {
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            // Cover page
            addCoverPage(document, page, startupName);

            // Table of Contents
            page = addNewPage(document);
            addTableOfContents(document, page);

            // Overview Section
            page = addNewPage(document);
            addOverviewSection(document, page, aiInsights);

            // Market Analysis Section
            page = addNewPage(document);
            addMarketAnalysisSection(document, page, aiInsights);

            // Competitive Analysis Section
            page = addNewPage(document);
            addCompetitiveAnalysisSection(document, page, aiInsights);

            // Risk Analysis Section
            page = addNewPage(document);
            addRiskAnalysisSection(document, page, aiInsights);

            // Recommendations Section
            page = addNewPage(document);
            addRecommendationsSection(document, page, aiInsights);

            // Insights Section
            page = addNewPage(document);
            addInsightsSection(document, page, aiInsights);

            // Convert to byte array
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            document.save(output);
            document.close();

            return output.toByteArray();

        } catch (IOException e) {
            throw new ReportGenerationException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Adds the cover page to the PDF document
     */
    private void addCoverPage(PDDocument document, PDPage page, String startupName) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        // Title
        stream.beginText();
        stream.setFont(PDType1Font.HELVETICA_BOLD, 48);
        stream.setLeading(60);
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - 150);
        stream.showText("Startup Validation");
        stream.newLine();
        stream.showText("Report");
        stream.endText();

        // Startup Name
        stream.beginText();
        stream.setFont(PDType1Font.HELVETICA, 24);
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - 250);
        stream.showText(startupName);
        stream.endText();

        // Date
        stream.beginText();
        stream.setFont(PDType1Font.HELVETICA, 12);
        stream.newLineAtOffset(MARGIN_X, 100);
        stream.showText("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy HH:mm")));
        stream.endText();

        stream.close();
    }

    /**
     * Adds table of contents page
     */
    private void addTableOfContents(PDDocument document, PDPage page) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        stream.beginText();
        stream.setFont(PDType1Font.HELVETICA_BOLD, 18);
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - MARGIN_TOP);
        stream.showText("Table of Contents");
        stream.endText();

        stream.setFont(PDType1Font.HELVETICA, 12);
        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 40;

        String[] sections = {
            "1. Overview",
            "2. Market Analysis",
            "3. Competitive Analysis",
            "4. Risk Analysis",
            "5. Recommendations",
            "6. Insights & Summary"
        };

        for (String section : sections) {
            stream.beginText();
            stream.newLineAtOffset(MARGIN_X + 20, yPosition);
            stream.showText(section);
            stream.endText();
            yPosition -= 30;
        }

        stream.close();
    }

    /**
     * Adds overview section with AI summary
     */
    private void addOverviewSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Overview");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String overview = extractText(aiInsights, "overview", "No overview available");
        yPosition = addWrappedText(stream, overview, yPosition);

        stream.close();
    }

    /**
     * Adds market analysis section
     */
    private void addMarketAnalysisSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Market Analysis");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String marketSize = extractText(aiInsights, "marketSize", "N/A");
        String marketGrowth = extractText(aiInsights, "marketGrowth", "N/A");
        String targetMarket = extractText(aiInsights, "targetMarket", "No data");

        yPosition = addWrappedText(stream, "Market Size: " + marketSize, yPosition);
        yPosition = addWrappedText(stream, "Market Growth: " + marketGrowth, yPosition);
        yPosition = addWrappedText(stream, "Target Market: " + targetMarket, yPosition);

        stream.close();
    }

    /**
     * Adds competitive analysis section
     */
    private void addCompetitiveAnalysisSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Competitive Analysis");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String competitors = extractText(aiInsights, "competitors", "No competitor data available");
        String competitive = extractText(aiInsights, "competitiveAdvantage", "N/A");

        yPosition = addWrappedText(stream, "Competitors: " + competitors, yPosition);
        yPosition = addWrappedText(stream, "Competitive Advantage: " + competitive, yPosition);

        stream.close();
    }

    /**
     * Adds risk analysis section
     */
    private void addRiskAnalysisSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Risk Analysis");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String risks = extractText(aiInsights, "risks", "No risk analysis available");
        String mitigation = extractText(aiInsights, "riskMitigation", "No mitigation strategies");

        yPosition = addWrappedText(stream, "Identified Risks: " + risks, yPosition);
        yPosition = addWrappedText(stream, "Risk Mitigation: " + mitigation, yPosition);

        stream.close();
    }

    /**
     * Adds recommendations section
     */
    private void addRecommendationsSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Recommendations");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String recommendations = extractText(aiInsights, "recommendations", "No recommendations available");
        yPosition = addWrappedText(stream, recommendations, yPosition);

        stream.close();
    }

    /**
     * Adds insights and summary section
     */
    private void addInsightsSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Insights & Summary");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String summary = extractText(aiInsights, "summary", "No summary available");
        String score = extractText(aiInsights, "opportunityScore", "N/A");

        yPosition = addWrappedText(stream, "Summary: " + summary, yPosition);
        yPosition = addWrappedText(stream, "Opportunity Score: " + score, yPosition);

        stream.close();
    }

    /**
     * Helper method to add section headers with underline
     */
    private void addSectionHeader(PDPageContentStream stream, String title) throws IOException {
        stream.setFont(PDType1Font.HELVETICA_BOLD, 18);
        stream.beginText();
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - MARGIN_TOP - 30);
        stream.showText(title);
        stream.endText();

        // Add horizontal line
        stream.setLineWidth(1);
        stream.moveTo(MARGIN_X, PAGE_HEIGHT - MARGIN_TOP - 40);
        stream.lineTo(PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - MARGIN_TOP - 40);
        stream.stroke();
    }

    /**
     * Helper method to add wrapped text and return next Y position
     */
    private float addWrappedText(PDPageContentStream stream, String text, float yPosition) throws IOException {
        List<String> lines = wrapText(text, CONTENT_WIDTH, 11);

        for (String line : lines) {
            stream.beginText();
            stream.newLineAtOffset(MARGIN_X, yPosition);
            stream.showText(line);
            stream.endText();
            yPosition -= 15;

            if (yPosition < MARGIN_BOTTOM + 20) {
                yPosition = PAGE_HEIGHT - MARGIN_TOP - 30;
            }
        }

        return yPosition - 10;
    }

    /**
     * Helper method to wrap text to fit within max width
     */
    private List<String> wrapText(String text, float maxWidth, float fontSize) {
        List<String> lines = new ArrayList<>();
        String[] words = text.split(" ");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            if (currentLine.length() == 0) {
                currentLine.append(word);
            } else if ((currentLine.length() + 1 + word.length()) * fontSize * 0.5 < maxWidth) {
                currentLine.append(" ").append(word);
            } else {
                lines.add(currentLine.toString());
                currentLine = new StringBuilder(word);
            }
        }

        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }

        return lines;
    }

    /**
     * Helper method to add a new page to document
     */
    private PDPage addNewPage(PDDocument document) {
        PDPage page = new PDPage();
        document.addPage(page);
        return page;
    }

    /**
     * Helper method to extract text from map with fallback
     */
    private String extractText(Map<String, Object> data, String key, String fallback) {
        try {
            Object value = data.get(key);
            if (value != null) {
                if (value instanceof String) {
                    return (String) value;
                }
                return value.toString();
            }
        } catch (Exception e) {
            // Return fallback on error
        }
        return fallback;
    }
}

        try {
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            // Cover page
            addCoverPage(document, page, startupName);

            // Table of Contents
            page = addNewPage(document);
            addTableOfContents(document, page);

            // Overview Section
            page = addNewPage(document);
            addOverviewSection(document, page, aiInsights);

            // Market Analysis Section
            page = addNewPage(document);
            addMarketAnalysisSection(document, page, aiInsights);

            // Competitive Analysis Section
            page = addNewPage(document);
            addCompetitiveAnalysisSection(document, page, aiInsights);

            // Risk Analysis Section
            page = addNewPage(document);
            addRiskAnalysisSection(document, page, aiInsights);

            // Recommendations Section
            page = addNewPage(document);
            addRecommendationsSection(document, page, aiInsights);

            // Insights Section
            page = addNewPage(document);
            addInsightsSection(document, page, aiInsights);

            // Convert to byte array
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            document.save(output);
            document.close();

            return output.toByteArray();

        } catch (IOException e) {
            throw new ReportGenerationException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    private void addCoverPage(PDDocument document, PDPage page, String startupName) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        // Title
        stream.beginText();
        stream.setFont(PDType1Font.HELVETICA_BOLD, 48);
        stream.setLeading(60);
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - 150);
        stream.showText("Startup Validation");
        stream.newLine();
        stream.showText("Report");
        stream.endText();

        // Startup Name
        stream.beginText();
        stream.setFont(PDType1Font.HELVETICA, 24);
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - 250);
        stream.showText(startupName);
        stream.endText();

        // Date
        stream.beginText();
        stream.setFont(PDType1Font.HELVETICA, 12);
        stream.newLineAtOffset(MARGIN_X, 100);
        stream.showText("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy HH:mm")));
        stream.endText();

        stream.close();
    }

    private void addTableOfContents(PDDocument document, PDPage page) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        stream.beginText();
        stream.setFont(PDType1Font.HELVETICA_BOLD, 18);
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - MARGIN_TOP);
        stream.showText("Table of Contents");
        stream.endText();

        stream.setFont(PDType1Font.HELVETICA, 12);
        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 40;

        String[] sections = {
            "1. Overview",
            "2. Market Analysis",
            "3. Competitive Analysis",
            "4. Risk Analysis",
            "5. Recommendations",
            "6. Insights & Summary"
        };

        for (String section : sections) {
            stream.beginText();
            stream.newLineAtOffset(MARGIN_X + 20, yPosition);
            stream.showText(section);
            stream.endText();
            yPosition -= 30;
        }

        stream.close();
    }

    private void addOverviewSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Overview");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String overview = extractText(aiInsights, "overview", "No overview available");
        yPosition = addWrappedText(stream, overview, yPosition);

        stream.close();
    }

    private void addMarketAnalysisSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Market Analysis");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String marketSize = extractText(aiInsights, "marketSize", "N/A");
        String marketGrowth = extractText(aiInsights, "marketGrowth", "N/A");
        String targetMarket = extractText(aiInsights, "targetMarket", "No data");

        yPosition = addWrappedText(stream, "Market Size: " + marketSize, yPosition);
        yPosition = addWrappedText(stream, "Market Growth: " + marketGrowth, yPosition);
        yPosition = addWrappedText(stream, "Target Market: " + targetMarket, yPosition);

        stream.close();
    }

    private void addCompetitiveAnalysisSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Competitive Analysis");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String competitors = extractText(aiInsights, "competitors", "No competitor data available");
        String competitive = extractText(aiInsights, "competitiveAdvantage", "N/A");

        yPosition = addWrappedText(stream, "Competitors: " + competitors, yPosition);
        yPosition = addWrappedText(stream, "Competitive Advantage: " + competitive, yPosition);

        stream.close();
    }

    private void addRiskAnalysisSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Risk Analysis");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String risks = extractText(aiInsights, "risks", "No risk analysis available");
        String mitigation = extractText(aiInsights, "riskMitigation", "No mitigation strategies");

        yPosition = addWrappedText(stream, "Identified Risks: " + risks, yPosition);
        yPosition = addWrappedText(stream, "Risk Mitigation: " + mitigation, yPosition);

        stream.close();
    }

    private void addRecommendationsSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Recommendations");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String recommendations = extractText(aiInsights, "recommendations", "No recommendations available");
        yPosition = addWrappedText(stream, recommendations, yPosition);

        stream.close();
    }

    private void addInsightsSection(PDDocument document, PDPage page, Map<String, Object> aiInsights) throws IOException {
        PDPageContentStream stream = new PDPageContentStream(document, page);

        addSectionHeader(stream, "Insights & Summary");

        float yPosition = PAGE_HEIGHT - MARGIN_TOP - 80;
        stream.setFont(PDType1Font.HELVETICA, 11);

        String summary = extractText(aiInsights, "summary", "No summary available");
        String score = extractText(aiInsights, "opportunityScore", "N/A");

        yPosition = addWrappedText(stream, "Summary: " + summary, yPosition);
        yPosition = addWrappedText(stream, "Opportunity Score: " + score, yPosition);

        stream.close();
    }

    private void addSectionHeader(PDPageContentStream stream, String title) throws IOException {
        stream.setFont(PDType1Font.HELVETICA_BOLD, 18);
        stream.beginText();
        stream.newLineAtOffset(MARGIN_X, PAGE_HEIGHT - MARGIN_TOP - 30);
        stream.showText(title);
        stream.endText();

        // Add horizontal line
        stream.setLineWidth(1);
        stream.moveTo(MARGIN_X, PAGE_HEIGHT - MARGIN_TOP - 40);
        stream.lineTo(PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - MARGIN_TOP - 40);
        stream.stroke();
    }

    private float addWrappedText(PDPageContentStream stream, String text, float yPosition) throws IOException {
        List<String> lines = wrapText(text, CONTENT_WIDTH, 11);

        for (String line : lines) {
            stream.beginText();
            stream.newLineAtOffset(MARGIN_X, yPosition);
            stream.showText(line);
            stream.endText();
            yPosition -= 15;

            if (yPosition < MARGIN_BOTTOM + 20) {
                yPosition = PAGE_HEIGHT - MARGIN_TOP - 30;
                // In a real implementation, would create new page here
            }
        }

        return yPosition - 10;
    }

    private List<String> wrapText(String text, float maxWidth, float fontSize) {
        List<String> lines = new ArrayList<>();
        String[] words = text.split(" ");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            if (currentLine.length() == 0) {
                currentLine.append(word);
            } else if ((currentLine.length() + 1 + word.length()) * fontSize * 0.5 < maxWidth) {
                currentLine.append(" ").append(word);
            } else {
                lines.add(currentLine.toString());
                currentLine = new StringBuilder(word);
            }
        }

        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }

        return lines;
    }

    private PDPage addNewPage(PDDocument document) {
        PDPage page = new PDPage();
        document.addPage(page);
        return page;
    }

    private String extractText(Map<String, Object> data, String key, String fallback) {
        try {
            Object value = data.get(key);
            if (value != null) {
                if (value instanceof String) {
                    return (String) value;
                }
                return value.toString();
            }
        } catch (Exception e) {
            // Fallback to default
        }
        return fallback;
    }
}
