package com.shulventures.consultancymanagement.dto.gst;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GstBillResponse(
        Long interviewId,
        Long associateId,
        String name,
        String phone,
        String address,
        LocalDate serviceDate,
        BigDecimal finalAmount,
        BigDecimal paidAmount
) {}
