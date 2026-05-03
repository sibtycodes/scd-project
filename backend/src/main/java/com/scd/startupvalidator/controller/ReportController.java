package com.scd.startupvalidator.controller;

import com.scd.startupvalidator.dto.ReportResponse;
import com.scd.startupvalidator.entity.StartupValidation;
import com.scd.startupvalidator.repository.StartupValidationRepository;
import com.scd.startupvalidator.service.ReportGenerationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final Logger logger =
            LoggerFactory.getLogger(ReportController.class);

    private final ReportGenerationService reportGenerationService;
    private final StartupValidationRepository startupValidationRepository;

    public ReportController(
            ReportGenerationService reportGenerationService,
            StartupValidationRepository startupValidationRepository
    ) {
        this.reportGenerationService = reportGenerationService;
        this.startupValidationRepository = startupValidationRepository;
    }

    @PostMapping("/generate/{validationId}")
    public ResponseEntity<ReportResponse> generateReport(
            @PathVariable Long validationId
    ) {

        logger.info(
                "Generating report for validation id: {}",
                validationId
        );

        StartupValidation validation =
                startupValidationRepository.findById(validationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Validation not found with id: "
                                                + validationId
                                )
                        );

        ReportResponse report =
                reportGenerationService.generateAndSaveReport(validation);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/{validationId}")
    public ResponseEntity<ReportResponse> getReportByValidation(
            @PathVariable Long validationId
    ) {

        logger.info(
                "Fetching report for validation id: {}",
                validationId
        );

        ReportResponse report =
                reportGenerationService.getReportByValidation(validationId);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/report/{reportId}")
    public ResponseEntity<ReportResponse> getReportById(
            @PathVariable Long reportId
    ) {

        logger.info(
                "Fetching report by report id: {}",
                reportId
        );

        ReportResponse report =
                reportGenerationService.getReportById(reportId);

        return ResponseEntity.ok(report);
    }
}