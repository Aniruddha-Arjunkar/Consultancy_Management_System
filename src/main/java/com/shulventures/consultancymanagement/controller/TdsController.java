package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.payment.TdsDueResponse;
import com.shulventures.consultancymanagement.service.TdsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.shulventures.consultancymanagement.dto.payment.TdsPaidResponse;
import java.util.List;

@RestController
@RequestMapping("/api/accounts/tds")
@RequiredArgsConstructor
public class TdsController {

    private final TdsService tdsService;

    @GetMapping("/due")
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'TDS_DUE')")
    public List<TdsDueResponse> getDueTds() {
        return tdsService.getDueTds();
    }

    @PatchMapping("/{paymentId}/paid")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'TDS_DUE')")
    public void markTdsPaid(@PathVariable Long paymentId) {
        tdsService.markTdsPaid(paymentId);
    }


    @GetMapping("/paid")
    @PreAuthorize("@permissionService.hasPage(authentication, 'ACCOUNTS', 'TDS_PAID')")
    public List<TdsPaidResponse> getPaidTds() {
        return tdsService.getPaidTds();
    }
}
