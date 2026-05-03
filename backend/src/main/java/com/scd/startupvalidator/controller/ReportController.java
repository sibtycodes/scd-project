package com.scd.startupvalidator.controller;

import com.scd.startupvalidator.dto.ReportResponse;
import com.scd.startupvalidator.service.ReportGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportGenerationService reportGenerationService;

    public ReportController(ReportGenerationService reportGenerationService) {
        this.reportGenerationService = reportGenerationService;
    }

    @GetMapping("/{validationId}")
    public ResponseEntity<ReportResponse> getReportByValidation(@PathVariable Long validationId) {
        ReportResponse report = reportGenerationService.getReportByValidation(validationId);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/report/{reportId}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable Long reportId) {
        ReportResponse report = reportGenerationService.getReportById(reportId);
        return ResponseEntity.ok(report);
    }
}
