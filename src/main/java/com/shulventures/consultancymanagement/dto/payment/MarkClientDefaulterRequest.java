package com.shulventures.consultancymanagement.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MarkClientDefaulterRequest(
        @NotBlank
        @Size(max = 1000)
        String defaulterNote
) {
}