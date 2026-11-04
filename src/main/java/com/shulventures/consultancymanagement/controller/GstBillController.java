package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.gst.GstBillResponse;
import com.shulventures.consultancymanagement.dto.gst.CreateGstInvoiceRequest;
import com.shulventures.consultancymanagement.dto.gst.GstInvoiceResponse;
import com.shulventures.consultancymanagement.service.GstBillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
}
