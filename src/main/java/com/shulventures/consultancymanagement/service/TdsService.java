package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.payment.TdsDueResponse;
import com.shulventures.consultancymanagement.entity.Agreement;
import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.ConsultancyPaymentRepository;
import com.shulventures.consultancymanagement.repository.InterviewPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.shulventures.consultancymanagement.dto.payment.TdsPaidResponse;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TdsService {

    private final ConsultancyPaymentRepository paymentRepository;
    private final InterviewPlacementRepository placementRepository;
    private final AgreementRepository agreementRepository;

    @Transactional(readOnly = true)
    public List<TdsDueResponse> getDueTds() {
        List<ConsultancyPayment> payments =
                paymentRepository.findCompanyTdsDue();

        List<Long> interviewIds = payments.stream()
                .map(ConsultancyPayment::getInterviewId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, InterviewPlacement> placements = new HashMap<>();
        placementRepository.findAllById(interviewIds).forEach(placement ->
                placements.put(placement.getInterviewId(), placement)
        );

        List<Long> candidateIds = placements.values().stream()
                .map(InterviewPlacement::getCandidateId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, Agreement> candidates = new HashMap<>();
        agreementRepository.findAllById(candidateIds).forEach(candidate ->
                candidates.put(candidate.getId(), candidate)
        );

        return payments.stream()
                .filter(payment -> payment.getInterviewId() != null)
                .map(payment -> {
                    InterviewPlacement placement =
                            placements.get(payment.getInterviewId());

                    if (placement == null) {
                        return null;
                    }

                    Agreement candidate =
                            candidates.get(placement.getCandidateId());

                    String companyName = firstNonBlank(
                            placement.getCompanyName(),
                            "Unknown Company"
                    );

                    String candidateName = firstNonBlank(
                            placement.getCandidateName(),
                            candidate == null ? null : candidate.getName(),
                            "Unknown Candidate"
                    );

                    BigDecimal amount = payment.getTdsAmount() == null
                            ? BigDecimal.ZERO
                            : payment.getTdsAmount();

                    return new TdsDueResponse(
                            payment.getId(),
                            companyName + " (" + candidateName + ")",
                            amount,
                            payment.getPaymentDate()
                    );
                })
                .filter(response -> response != null)
                .toList();
    }

    @Transactional
    public void markTdsPaid(Long paymentId) {
        ConsultancyPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Payment not found.")
                );

        if (!"Company Pay".equals(payment.getPaymentType())) {
            throw new IllegalArgumentException(
                    "Only company TDS can be marked paid from this page."
            );
        }

        if (payment.getTdsAmount() == null
                || payment.getTdsAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "This payment has no TDS amount due."
            );
        }

        if (Boolean.TRUE.equals(payment.getTdsPaid())) {
            throw new IllegalArgumentException(
                    "This TDS payment is already marked paid."
            );
        }

        payment.setTdsPaid(true);
        paymentRepository.save(payment);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }


    @Transactional(readOnly = true)
    public List<TdsPaidResponse> getPaidTds() {
        List<ConsultancyPayment> payments =
                paymentRepository.findCompanyTdsPaid();

        List<Long> interviewIds = payments.stream()
                .map(ConsultancyPayment::getInterviewId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, InterviewPlacement> placements = new HashMap<>();
        placementRepository.findAllById(interviewIds).forEach(placement ->
                placements.put(placement.getInterviewId(), placement)
        );

        List<Long> candidateIds = placements.values().stream()
                .map(InterviewPlacement::getCandidateId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, Agreement> candidates = new HashMap<>();
        agreementRepository.findAllById(candidateIds).forEach(candidate ->
                candidates.put(candidate.getId(), candidate)
        );

        return payments.stream()
                .filter(payment -> payment.getInterviewId() != null)
                .map(payment -> {
                    InterviewPlacement placement =
                            placements.get(payment.getInterviewId());

                    if (placement == null) {
                        return null;
                    }

                    Agreement candidate =
                            candidates.get(placement.getCandidateId());

                    String companyName = firstNonBlank(
                            placement.getCompanyName(),
                            "Unknown Company"
                    );

                    String candidateName = firstNonBlank(
                            placement.getCandidateName(),
                            candidate == null ? null : candidate.getName(),
                            "Unknown Candidate"
                    );

                    BigDecimal tdsAmount = payment.getTdsAmount() == null
                            ? BigDecimal.ZERO
                            : payment.getTdsAmount();

                    return new TdsPaidResponse(
                            payment.getId(),
                            companyName + " (" + candidateName + ")",
                            tdsAmount,
                            payment.getPaymentDate()
                    );
                })
                .filter(response -> response != null)
                .toList();
    }
}
