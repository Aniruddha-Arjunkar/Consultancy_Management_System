package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.gst.GstBillResponse;
import com.shulventures.consultancymanagement.service.GstBillService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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
}
