package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.service.DefaulterPaymentService;
import com.shulventures.consultancymanagement.dto.payment.*;
import com.shulventures.consultancymanagement.service.DuePaymentService;
import com.shulventures.consultancymanagement.service.PaymentManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.shulventures.consultancymanagement.service.PaymentHistoryService;
import java.util.List;

@RestController
@RequestMapping("/api/accounts/payments")
@RequiredArgsConstructor
public class DuePaymentController {

    private final DuePaymentService duePaymentService;
    private final PaymentManagementService paymentManagementService;
    private final PaymentHistoryService paymentHistoryService;
    private final DefaulterPaymentService defaulterPaymentService;

    @GetMapping("/due")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'PAYMENTS_DUE')"
    )
    public List<DuePaymentResponse> getDuePayments() {
        return duePaymentService.getDuePayments();
    }


    @GetMapping("/{paymentId}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'PAYMENTS_DUE')"
    )
    public DuePaymentDetailResponse getPayment(
            @PathVariable Long paymentId
    ) {
        return paymentManagementService.getPayment(paymentId);
    }

    @PutMapping("/{paymentId}")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'PAYMENTS_DUE')"
    )
    public DuePaymentDetailResponse updatePayment(
            @PathVariable Long paymentId,
            @Valid @RequestBody DuePaymentUpdateRequest request
    ) {
        return paymentManagementService.updatePayment(paymentId, request);
    }

    @PatchMapping("/clients/{clientId}/defaulter")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'PAYMENTS_DUE')"
    )
    public void markClientDefaulter(
            @PathVariable String clientId,
            @Valid @RequestBody MarkClientDefaulterRequest request
    ) {
        paymentManagementService.markClientDefaulter(
                clientId,
                request.defaulterNote()
        );
    }

    @GetMapping("/history")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'PAYMENTS_VIEW')"
    )
    public List<PaymentHistoryResponse> getPaymentHistory() {
        return paymentHistoryService.getPaymentHistory();
    }


    @GetMapping("/defaulters")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'PAYMENTS_DEFAULTER')"
    )
    public List<DefaulterPaymentResponse> getDefaulterPayments() {
        return defaulterPaymentService.getDefaulterPayments();
    }

    @PatchMapping("/clients/{clientId}/reactivate")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'PAYMENTS_DEFAULTER')"
    )
    public void reactivateClient(@PathVariable String clientId) {
        paymentManagementService.reactivateClient(clientId);
    }
}