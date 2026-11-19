package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.associate.AssociateCompanyPaymentResponse;
import com.shulventures.consultancymanagement.entity.Agreement;
import com.shulventures.consultancymanagement.entity.AssociateCompany;
import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.AssociateCompanyRepository;
import com.shulventures.consultancymanagement.repository.ConsultancyPaymentRepository;
import com.shulventures.consultancymanagement.repository.InterviewPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssociateCompanyPaymentService {

    private final AssociateCompanyRepository companyRepository;
    private final InterviewPlacementRepository placementRepository;
    private final ConsultancyPaymentRepository paymentRepository;
    private final AgreementRepository agreementRepository;

    @Transactional(readOnly = true)
    public List<AssociateCompanyPaymentResponse> getPaymentDetails(Long companyId) {
        AssociateCompany company = companyRepository.findById(companyId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Associate company not found.")
                );

        List<InterviewPlacement> placements =
                placementRepository
                        .findByCompanyNameIgnoreCaseAndInterviewStatusOrderByInterviewIdDesc(
                                company.getCompanyName(),
                                "Placed"
                        );

        if (placements.isEmpty()) {
            return List.of();
        }

        List<Long> interviewIds = placements.stream()
                .map(InterviewPlacement::getInterviewId)
                .toList();

        Map<Long, ConsultancyPayment> companyPayments = new HashMap<>();

        paymentRepository.findByInterviewIdInAndPaymentType(
                interviewIds,
                "Company Pay"
        ).forEach(payment -> {
            ConsultancyPayment previous = companyPayments.putIfAbsent(
                    payment.getInterviewId(),
                    payment
            );

            if (previous != null) {
                throw new IllegalStateException(
                        "Multiple Company Pay records exist for interview "
                                + payment.getInterviewId()
                );
            }
        });

        List<InterviewPlacement> companyPayPlacements = placements.stream()
                .filter(placement ->
                        hasCompanyPayObligation(placement, companyPayments)
                )
                .toList();

        if (companyPayPlacements.isEmpty()) {
            return List.of();
        }

//        List<Long> candidateIds = placements.stream()
//                .map(InterviewPlacement::getCandidateId)
//                .distinct()
//                .toList();
        List<Long> candidateIds = companyPayPlacements.stream()
                .map(InterviewPlacement::getCandidateId)
                .distinct()
                .toList();

        Map<Long, Agreement> candidates = new HashMap<>();
        agreementRepository.findAllById(candidateIds).forEach(candidate ->
                candidates.put(candidate.getId(), candidate)
        );

        return companyPayPlacements.stream()
                .map(placement -> {
                    ConsultancyPayment payment =
                            companyPayments.get(placement.getInterviewId());

                    BigDecimal baseAmount =
                            zeroIfNull(placement.getCompanyPayAmount());
                    BigDecimal gstAmount =
                            zeroIfNull(placement.getCompanyGstAmount());

                    BigDecimal totalAmount = payment == null
                            ? baseAmount.add(gstAmount)
                            : zeroIfNull(payment.getTotalAmount());

                    BigDecimal paidAmount = payment == null
                            ? BigDecimal.ZERO
                            : zeroIfNull(payment.getPaidAmount());

                    BigDecimal tdsAmount = payment == null
                            ? BigDecimal.ZERO
                            : zeroIfNull(payment.getTdsAmount());

                    Boolean tdsPaid = payment != null
                            && Boolean.TRUE.equals(payment.getTdsPaid());

                    // Company Pay TDS reduces cash balance regardless of remittance status.
                    BigDecimal tdsCredit = payment == null
                            ? BigDecimal.ZERO
                            : tdsAmount;

                    BigDecimal balanceAmount = totalAmount
                            .subtract(paidAmount)
                            .subtract(tdsCredit)
                            .max(BigDecimal.ZERO)
                            .setScale(2, java.math.RoundingMode.HALF_UP);

                    String category = getCategory(
                            payment,
                            totalAmount,
                            paidAmount
                    );

                    Agreement candidate = candidates.get(placement.getCandidateId());

                    String candidateName = firstNonBlank(
                            placement.getCandidateName(),
                            candidate == null ? null : candidate.getName(),
                            "Unknown Candidate"
                    );

                    boolean gstEnabled = placement.getCompanyGstAmount() != null;

                    return new AssociateCompanyPaymentResponse(
                            placement.getInterviewId(),
                            payment == null ? null : payment.getId(),
                            placement.getCandidateId(),
                            candidateName,
                            baseAmount,
                            gstAmount,
                            gstEnabled,
                            totalAmount,
                            paidAmount,
                            tdsAmount,
                            tdsPaid,
                            balanceAmount,
                            payment == null
                                    ? placement.getCompanyPayDate()
                                    : payment.getDueDate(),
                            category
                    );
                })
                .toList();
    }

    private String getCategory(
            ConsultancyPayment payment,
            BigDecimal totalAmount,
            BigDecimal paidAmount
    ) {
        if (payment != null
                && "defaulted".equalsIgnoreCase(payment.getStatus())) {
            return "defaulted";
        }

        // Match the senior page: payment category is based on cash paid.
//        if (totalAmount.signum() > 0
//                && paidAmount.compareTo(totalAmount) >= 0) {
//            return "paid";
//        }
//
//        if (paidAmount.signum() > 0
//                && paidAmount.compareTo(totalAmount) < 0) {
//            return "partial";
//        }
//
//        return "unpaid";

        //Check whether TDS status first
        BigDecimal paidTdsAmount =
                payment != null && Boolean.TRUE.equals(payment.getTdsPaid())
                        ? zeroIfNull(payment.getTdsAmount())
                        : BigDecimal.ZERO;

        BigDecimal settledAmount = paidAmount.add(paidTdsAmount);

        if (totalAmount.signum() > 0
                && settledAmount.compareTo(totalAmount) >= 0) {
            return "paid";
        }

        if (settledAmount.signum() > 0
                && settledAmount.compareTo(totalAmount) < 0) {
            return "partial";
        }

        return "unpaid";
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }

        return "";
    }

    private boolean hasCompanyPayObligation(
            InterviewPlacement placement,
            Map<Long, ConsultancyPayment> companyPayments
    ) {
        // Keep the placement if a Company Pay payment record exists.
        if (companyPayments.containsKey(placement.getInterviewId())) {
            return true;
        }

        // Keep an explicitly selected Company Pay or Both Pay placement,
        // including one whose payment record hasn't been created yet.
        String paymentType = placement.getPaymentType() == null
                ? ""
                : placement.getPaymentType().trim();

        if ("Company Pay".equalsIgnoreCase(paymentType)
                || "Both Pay".equalsIgnoreCase(paymentType)) {
            return true;
        }

        // Also keep a placement with a recorded company amount.
        return isPositive(placement.getCompanyPayAmount())
                || isPositive(placement.getCompanyGstAmount());
    }

    private boolean isPositive(BigDecimal amount) {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }
}
