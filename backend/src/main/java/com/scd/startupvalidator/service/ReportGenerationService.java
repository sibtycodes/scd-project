package com.scd.startupvalidator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scd.startupvalidator.dto.ReportResponse;
import com.scd.startupvalidator.entity.AppUser;
import com.scd.startupvalidator.entity.Report;
import com.scd.startupvalidator.entity.StartupValidation;
import com.scd.startupvalidator.exception.ReportGenerationException;
import com.scd.startupvalidator.exception.SupabaseUploadException;
import com.scd.startupvalidator.repository.ReportRepository;
import com.scd.startupvalidator.repository.UserRepository;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class ReportGenerationService {

    private final ReportPDFBuilder pdfBuilder;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.storage.bucket-name}")
    private String bucketName;

    @Value("${supabase.project-id}")
    private String supabaseProjectId;

    public ReportGenerationService(
            ReportPDFBuilder pdfBuilder,
            ReportRepository reportRepository,
            UserRepository userRepository,
            OkHttpClient httpClient,
            ObjectMapper objectMapper
    ) {
        this.pdfBuilder = pdfBuilder;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ReportResponse generateAndSaveReport(StartupValidation validation) throws ReportGenerationException, SupabaseUploadException {
        AppUser user = getLoggedInUser();

        // Check if report already exists
        if (reportRepository.existsByValidation(validation)) {
            Report existingReport = reportRepository.findByValidation(validation)
                    .orElseThrow(() -> new ReportGenerationException("Report exists but could not be retrieved"));
            return ReportResponse.fromEntity(existingReport);
        }

        // Parse AI insights
        Map<String, Object> aiInsights;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> parsedInsights = objectMapper.readValue(validation.getAiInsights(), Map.class);
            aiInsights = parsedInsights;
        } catch (Exception e) {
            throw new ReportGenerationException("Failed to parse AI insights: " + e.getMessage(), e);
        }

        // Generate PDF
        byte[] pdfBytes = pdfBuilder.generatePDF(validation.getStartupName(), aiInsights);

        // Upload to Supabase
        String fileName = generateFileName(validation.getStartupName());
        String fileUrl = uploadToSupabase(pdfBytes, fileName);

        // Save report record
        Report report = Report.builder()
                .validation(validation)
                .user(user)
                .fileName(fileName)
                .fileUrl(fileUrl)
                .fileSize((long) pdfBytes.length)
                .generatedAt(LocalDateTime.now())
                .build();

        Report savedReport = reportRepository.save(report);
        return ReportResponse.fromEntity(savedReport);
    }

    public String uploadToSupabase(byte[] pdfBytes, String fileName) throws SupabaseUploadException {
        try {
            String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, fileName);

            RequestBody requestBody = RequestBody.create(pdfBytes, MediaType.parse("application/pdf"));

            Request request = new Request.Builder()
                    .url(uploadUrl)
                    .post(requestBody)
                    .addHeader("Authorization", "Bearer " + supabaseKey)
                    .addHeader("Content-Type", "application/pdf")
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    throw new SupabaseUploadException(
                        String.format("Supabase upload failed (HTTP %d): %s", response.code(), errorBody)
                    );
                }
            }

            // Return public URL
            return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, fileName);

        } catch (IOException e) {
            throw new SupabaseUploadException("Failed to upload PDF to Supabase: " + e.getMessage(), e);
        }
    }

    public ReportResponse getReportByValidation(Long validationId) throws ReportGenerationException {
        AppUser user = getLoggedInUser();

        Report report = reportRepository.findByIdAndUser(validationId, user)
                .orElseThrow(() -> new ReportGenerationException("Report not found for this validation"));

        return ReportResponse.fromEntity(report);
    }

    public ReportResponse getReportById(Long reportId) throws ReportGenerationException {
        AppUser user = getLoggedInUser();

        Report report = reportRepository.findByIdAndUser(reportId, user)
                .orElseThrow(() -> new ReportGenerationException("Report not found"));

        return ReportResponse.fromEntity(report);
    }

    private String generateFileName(String startupName) {
        String sanitized = startupName.replaceAll("[^a-zA-Z0-9-]", "_").toLowerCase();
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return String.format("reports/%s_%s_%d.pdf", sanitized, uuid, System.currentTimeMillis());
    }

    private AppUser getLoggedInUser() throws ReportGenerationException {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ReportGenerationException("Logged-in user not found"));
    }
}
