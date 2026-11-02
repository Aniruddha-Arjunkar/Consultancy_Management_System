package com.shulventures.consultancymanagement.service;


import com.shulventures.consultancymanagement.dto.payment.PaymentHistoryResponse;
import com.shulventures.consultancymanagement.entity.Agreement;
import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.ConsultancyPaymentRepository;
import com.shulventures.consultancymanagement.repository.InterviewPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentHistoryService {

    private final ConsultancyPaymentRepository paymentRepository;
    private final InterviewPlacementRepository placementRepository;
    private final AgreementRepository agreementRepository;

    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse> getPaymentHistory() {
        List<ConsultancyPayment> payments = paymentRepository.findAll()
                .stream()
                .filter(payment ->
                        payment.getPaidAmount() != null
                                && payment.getPaymentDate() != null
                                && payment.getPaymentGateway() != null
                                && payment.getInterviewId() != null
                )
                .sorted(
                        Comparator.comparing(
                                ConsultancyPayment::getPaymentDate
                        ).reversed()
                )
                .toList();

        List<Long> interviewIds = payments.stream()
                .map(ConsultancyPayment::getInterviewId)
                .distinct()
                .toList();

        Map<Long, InterviewPlacement> placementsByInterviewId =
                new HashMap<>();

        placementRepository.findAllById(interviewIds)
                .forEach(placement ->
                        placementsByInterviewId.put(
                                placement.getInterviewId(),
                                placement
                        )
                );

        List<Long> candidateIds = placementsByInterviewId.values()
                .stream()
                .map(InterviewPlacement::getCandidateId)
                .filter(candidateId -> candidateId != null)
                .distinct()
                .toList();

        Map<Long, Agreement> candidatesById = new HashMap<>();

        agreementRepository.findAllById(candidateIds)
                .forEach(candidate ->
                        candidatesById.put(candidate.getId(), candidate)
                );

        return payments.stream()
                .map(payment -> {
                    InterviewPlacement placement =
                            placementsByInterviewId.get(payment.getInterviewId());

                    if (placement == null) {
                        return null;
                    }

                    Agreement candidate =
                            candidatesById.get(placement.getCandidateId());

                    String candidateName = firstNonBlank(
                            placement.getCandidateName(),
                            candidate == null ? null : candidate.getName(),
                            "Unknown Candidate"
                    );

                    String companyName = firstNonBlank(
                            placement.getCompanyName(),
                            "Unknown Company"
                    );

                    boolean companyPay =
                            "Company Pay".equals(payment.getPaymentType());

                    String payerName = companyPay
                            ? companyName + " (" + candidateName + ")"
                            : candidateName + " (" + companyName + ")";

                    return new PaymentHistoryResponse(
                            payment.getId(),
                            "—",
                            "Consultancy",
                            payerName,
                            payment.getPaidAmount(),
                            payment.getPaymentDate(),
                            payment.getPaymentGateway()
                    );
                })
                .filter(response -> response != null)
                .toList();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }

        return "";
    }
}
