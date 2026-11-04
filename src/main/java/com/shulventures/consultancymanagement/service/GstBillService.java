package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.gst.GstBillResponse;
import com.shulventures.consultancymanagement.dto.gst.CreateGstInvoiceRequest;
import com.shulventures.consultancymanagement.dto.gst.GstInvoiceResponse;
import com.shulventures.consultancymanagement.entity.GstInvoice;
import com.shulventures.consultancymanagement.repository.GstBillRepository;
import com.shulventures.consultancymanagement.repository.GstInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class GstBillService {

    private final GstBillRepository gstBillRepository;
    private final GstInvoiceRepository gstInvoiceRepository;

    @Transactional(readOnly = true)
    public List<GstBillResponse> getEligibleCompanyBills() {
        return gstBillRepository.findEligibleCompanyBills();
    }

    @Transactional(readOnly = true)
    public GstBillResponse getEligibleCompanyBill(Long interviewId) {
        GstBillResponse bill = gstBillRepository.findEligibleCompanyBills().stream()
                .filter(row -> row.interviewId().equals(interviewId))
                .findFirst()
                .orElse(null);
        if (bill == null) {
            throw new IllegalArgumentException(
                    "This placement is no longer eligible for GST invoicing."
            );
        }
        return bill;
    }

    @Transactional
    public GstInvoiceResponse createInvoice(
            Long interviewId,
            CreateGstInvoiceRequest request
    ) {
        GstBillResponse bill = getEligibleCompanyBill(interviewId);
        if (gstInvoiceRepository.existsByPlacementInterviewId(interviewId)) {
            throw new IllegalArgumentException(
                    "A GST invoice has already been generated for this placement."
            );
        }
        if (request.invoiceDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Invoice date cannot be in the future.");
        }

        BigDecimal sourceAmount = money(bill.finalAmount());
        TaxAmounts tax = calculateTax(sourceAmount, request.gstType());

        GstInvoice invoice = new GstInvoice();
        invoice.setEntityId(bill.associateId());
        invoice.setPlacementInterviewId(interviewId);
        invoice.setSourceType("Consultant");
        invoice.setGstType(request.gstType());
        invoice.setAmount(tax.baseAmount());
        invoice.setCgst(tax.cgst());
        invoice.setSgst(tax.sgst());
        invoice.setIgst(tax.igst());
        invoice.setTotalAmount(tax.totalAmount());
        invoice.setInvoiceDate(request.invoiceDate());
        invoice.setComments(request.comments() == null || request.comments().isBlank()
                ? null : request.comments().trim());
        invoice.setCompanyNameSnapshot(companyName(bill.name()));
        invoice.setCompanyGstNumberSnapshot(bill.gstNumber());
        invoice.setShippingAddressSnapshot(bill.address());

        GstInvoice saved = gstInvoiceRepository.saveAndFlush(invoice);
        saved.setInvoiceNumber(saved.getId() + 200);
        saved = gstInvoiceRepository.save(saved);
        return toResponse(saved, interviewId);
    }

    private TaxAmounts calculateTax(BigDecimal sourceAmount, String gstType) {
        BigDecimal baseAmount;
        BigDecimal cgst = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal sgst = cgst;
        BigDecimal igst = cgst;
        BigDecimal totalAmount;

        switch (gstType) {
            case "exclusive" -> {
                baseAmount = sourceAmount;
                BigDecimal tax = percent(baseAmount, 18);
                cgst = half(tax);
                sgst = tax.subtract(cgst).setScale(2, RoundingMode.HALF_UP);
                totalAmount = baseAmount.add(tax).setScale(2, RoundingMode.HALF_UP);
            }
            case "inclusive" -> {
                totalAmount = sourceAmount;
                baseAmount = totalAmount.divide(
                        new BigDecimal("1.18"), 2, RoundingMode.HALF_UP
                );
                BigDecimal tax = totalAmount.subtract(baseAmount)
                        .setScale(2, RoundingMode.HALF_UP);
                cgst = half(tax);
                sgst = tax.subtract(cgst).setScale(2, RoundingMode.HALF_UP);
            }
            case "igst" -> {
                baseAmount = sourceAmount;
                igst = percent(baseAmount, 18);
                totalAmount = baseAmount.add(igst).setScale(2, RoundingMode.HALF_UP);
            }
            case "normal" -> {
                baseAmount = sourceAmount;
                totalAmount = sourceAmount;
            }
            default -> throw new IllegalArgumentException("Select a valid GST type.");
        }

        return new TaxAmounts(baseAmount, cgst, sgst, igst, totalAmount);
    }

    private BigDecimal percent(BigDecimal amount, int percent) {
        return amount.multiply(BigDecimal.valueOf(percent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal half(BigDecimal amount) {
        return amount.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal money(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : amount.setScale(2, RoundingMode.HALF_UP);
    }

    private String companyName(String name) {
        int separator = name == null ? -1 : name.lastIndexOf(" (");
        return separator < 0 ? name : name.substring(0, separator);
    }

    private GstInvoiceResponse toResponse(GstInvoice invoice, Long interviewId) {
        return new GstInvoiceResponse(
                invoice.getId(), invoice.getInvoiceNumber(), interviewId,
                invoice.getCompanyNameSnapshot(), invoice.getCompanyGstNumberSnapshot(),
                invoice.getShippingAddressSnapshot(), invoice.getGstType(),
                invoice.getAmount(), invoice.getCgst(), invoice.getSgst(),
                invoice.getIgst(), invoice.getTotalAmount(), invoice.getInvoiceDate(),
                invoice.getComments()
        );
    }

    private record TaxAmounts(
            BigDecimal baseAmount,
            BigDecimal cgst,
            BigDecimal sgst,
            BigDecimal igst,
            BigDecimal totalAmount
    ) {}
}
