package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.gst.GstBillResponse;
import com.shulventures.consultancymanagement.dto.gst.CreateGstInvoiceRequest;
import com.shulventures.consultancymanagement.dto.gst.GstInvoiceResponse;
import com.shulventures.consultancymanagement.dto.gst.UpdateGstInvoiceRequest;
import com.shulventures.consultancymanagement.service.GstBillService;
import com.shulventures.consultancymanagement.service.GstInvoicePdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/gst-bills")
@RequiredArgsConstructor
public class GstBillController {

    private final GstBillService gstBillService;
    private final GstInvoicePdfService gstInvoicePdfService;

    @GetMapping("/generate-bills")
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'GST_GENERATE')")
    public List<GstBillResponse> getEligibleCompanyBills() {
        return gstBillService.getEligibleCompanyBills();
    }

    @GetMapping("/generate-bills/{interviewId}")
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'GST_GENERATE')")
    public GstBillResponse getEligibleCompanyBill(@PathVariable Long interviewId) {
        return gstBillService.getEligibleCompanyBill(interviewId);
    }

    @PostMapping("/generate-bills/{interviewId}/invoice")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'GST_GENERATE')")
    public GstInvoiceResponse createInvoice(
            @PathVariable Long interviewId,
            @Valid @RequestBody CreateGstInvoiceRequest request
    ) {
        return gstBillService.createInvoice(interviewId, request);
    }

    @GetMapping("/invoices")
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'GST_VIEW')")
    public List<GstInvoiceResponse> getInvoices() {
        return gstBillService.getInvoices();
    }

    @GetMapping("/invoices/{invoiceId}")
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'GST_VIEW')")
    public GstInvoiceResponse getInvoice(@PathVariable Long invoiceId) {
        return gstBillService.getInvoice(invoiceId);
    }

    @PutMapping("/invoices/{invoiceId}")
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'GST_VIEW')")
    public GstInvoiceResponse updateInvoice(
            @PathVariable Long invoiceId,
            @Valid @RequestBody UpdateGstInvoiceRequest request
    ) {
        return gstBillService.updateInvoice(invoiceId, request);
    }

    @GetMapping(value = "/invoices/{invoiceId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'GST_VIEW')")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long invoiceId) {
        GstInvoiceResponse invoice = gstBillService.getInvoice(invoiceId);
        byte[] pdf = gstInvoicePdfService.generate(invoiceId);
        String filename = "GST_Invoice_" + invoice.invoiceNumber() + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }
}
