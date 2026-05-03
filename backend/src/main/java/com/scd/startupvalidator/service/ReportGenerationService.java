package com.scd.startupvalidator.service;

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
import java.util.UUID;

@Service
public class ReportGenerationService {

    private final ReportPDFBuilder pdfBuilder;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final OkHttpClient httpClient;

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
            OkHttpClient httpClient
    ) {
        this.pdfBuilder = pdfBuilder;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.httpClient = httpClient;
    }

    @Transactional
    public ReportResponse generateAndSaveReport(
            StartupValidation validation
    ) throws ReportGenerationException, SupabaseUploadException {

        AppUser user = getLoggedInUser();

        if (reportRepository.existsByValidation(validation)) {

            Report existingReport =
                    reportRepository.findByValidation(validation)
                            .orElseThrow(() ->
                                    new ReportGenerationException(
                                            "Existing report could not be retrieved"
                                    )
                            );

            return ReportResponse.fromEntity(existingReport);
        }

        if (validation.getAiInsights() == null
                || validation.getAiInsights().isBlank()) {

            throw new ReportGenerationException(
                    "AI insights are missing for this validation"
            );
        }

        byte[] pdfBytes = pdfBuilder.generatePDF(validation);

        String fileName =
                generateFileName(validation.getStartupName());

        String fileUrl =
                uploadToSupabase(pdfBytes, fileName);

        Report report = Report.builder()
                .validation(validation)
                .user(user)
                .fileName(fileName)
                .fileUrl(fileUrl)
                .fileSize((long) pdfBytes.length)
                .generatedAt(LocalDateTime.now())
                .build();

        Report savedReport =
                reportRepository.save(report);

        return ReportResponse.fromEntity(savedReport);
    }

    public String uploadToSupabase(
            byte[] pdfBytes,
            String fileName
    ) throws SupabaseUploadException {

        try {

            String uploadUrl =
                    String.format(
                            "%s/storage/v1/object/%s/%s",
                            supabaseUrl,
                            bucketName,
                            fileName
                    );

            RequestBody requestBody =
                    RequestBody.create(
                            pdfBytes,
                            MediaType.parse("application/pdf")
                    );

            Request request =
                    new Request.Builder()
                            .url(uploadUrl)
                            .post(requestBody)
                            .addHeader(
                                    "Authorization",
                                    "Bearer " + supabaseKey
                            )
                            .addHeader(
                                    "apikey",
                                    supabaseKey
                            )
                            .addHeader(
                                    "Content-Type",
                                    "application/pdf"
                            )
                            .addHeader(
                                    "x-upsert",
                                    "true"
                            )
                            .build();

            try (Response response =
                         httpClient.newCall(request).execute()) {

                if (!response.isSuccessful()) {

                    String errorBody =
                            response.body() != null
                                    ? response.body().string()
                                    : "Unknown upload error";

                    throw new SupabaseUploadException(
                            "Supabase upload failed. HTTP "
                                    + response.code()
                                    + " - "
                                    + errorBody
                    );
                }
            }

            return String.format(
                    "%s/storage/v1/object/public/%s/%s",
                    supabaseUrl,
                    bucketName,
                    fileName
            );

        } catch (IOException e) {

            throw new SupabaseUploadException(
                    "Failed to upload PDF to Supabase: "
                            + e.getMessage(),
                    e
            );
        }
    }

    public ReportResponse getReportByValidation(
            Long validationId
    ) throws ReportGenerationException {

        AppUser user = getLoggedInUser();

        Report report =
                reportRepository.findByValidationIdAndUser(
                                validationId,
                                user
                        )
                        .orElseThrow(() ->
                                new ReportGenerationException(
                                        "Report not found for validation id: "
                                                + validationId
                                )
                        );

        return ReportResponse.fromEntity(report);
    }

    public ReportResponse getReportById(
            Long reportId
    ) throws ReportGenerationException {

        AppUser user = getLoggedInUser();

        Report report =
                reportRepository.findByIdAndUser(
                                reportId,
                                user
                        )
                        .orElseThrow(() ->
                                new ReportGenerationException(
                                        "Report not found with id: "
                                                + reportId
                                )
                        );

        return ReportResponse.fromEntity(report);
    }

    private String generateFileName(
            String startupName
    ) {

        String sanitized =
                startupName
                        .replaceAll(
                                "[^a-zA-Z0-9]",
                                "_"
                        )
                        .toLowerCase();

        String uuid =
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8);

        return String.format(
                "reports/%s_%s_%d.pdf",
                sanitized,
                uuid,
                System.currentTimeMillis()
        );
    }

    private AppUser getLoggedInUser()
            throws ReportGenerationException {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ReportGenerationException(
                                "Logged in user not found"
                        )
                );
    }
}