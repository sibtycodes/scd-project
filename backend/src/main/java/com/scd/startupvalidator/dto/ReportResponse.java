package com.scd.startupvalidator.dto;

import com.scd.startupvalidator.entity.Report;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {

    private Long reportId;
    private Long validationId;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private LocalDateTime generatedAt;
    private LocalDateTime createdAt;

    public static ReportResponse fromEntity(Report report) {
        return ReportResponse.builder()
                .reportId(report.getId())
                .validationId(report.getValidation().getId())
                .fileName(report.getFileName())
                .fileUrl(report.getFileUrl())
                .fileSize(report.getFileSize())
                .generatedAt(report.getGeneratedAt())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
