package com.shulventures.consultancymanagement.dto.gst;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GstInvoiceResponse(
        Long id,
        Long invoiceNumber,
        Long interviewId,
        String companyName,
        String gstNumber,
        String shippingAddress,
        String gstType,
        BigDecimal amount,
        BigDecimal cgst,
        BigDecimal sgst,
        BigDecimal igst,
        BigDecimal totalAmount,
        LocalDate invoiceDate,
        String comments
) {}
