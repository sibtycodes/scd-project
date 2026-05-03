package com.scd.startupvalidator.exception;

public class SupabaseUploadException extends RuntimeException {

    public SupabaseUploadException(String message) {
        super(message);
    }

    public SupabaseUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}
