package com.scd.startupvalidator.controller;

import com.scd.startupvalidator.dto.StartupValidationRequest;
import com.scd.startupvalidator.dto.StartupValidationResponse;
import com.scd.startupvalidator.service.StartupValidationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/validations")
public class StartupValidationController {

    private final StartupValidationService validationService;

    public StartupValidationController(StartupValidationService validationService) {
        this.validationService = validationService;
    }

    @PostMapping
    public ResponseEntity<StartupValidationResponse> createValidation(
            @Valid @RequestBody StartupValidationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(validationService.createValidation(request));
    }

    @GetMapping
    public ResponseEntity<List<StartupValidationResponse>> getMyValidations() {
        return ResponseEntity.ok(validationService.getMyValidations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StartupValidationResponse> getMyValidationById(@PathVariable Long id) {
        return ResponseEntity.ok(validationService.getMyValidationById(id));
    }
}
