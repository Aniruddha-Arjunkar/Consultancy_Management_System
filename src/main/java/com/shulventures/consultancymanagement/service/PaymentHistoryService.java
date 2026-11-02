package com.shulventures.consultancymanagement.service;


import com.shulventures.consultancymanagement.dto.payment.PaymentHistoryResponse;
import com.shulventures.consultancymanagement.entity.Agreement;
import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import com.shulventures.consultancymanagement.entity.ConsultancyPaymentTransaction;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.ConsultancyPaymentRepository;
import com.shulventures.consultancymanagement.repository.ConsultancyPaymentTransactionRepository;
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
    private final ConsultancyPaymentTransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse> getPaymentHistory() {
        List<ConsultancyPaymentTransaction> transactions =
                transactionRepository.findAllByOrderByPaymentDateDescIdDesc();

        List<Long> paymentIds = transactions.stream()
                .map(ConsultancyPaymentTransaction::getPaymentId)
                .distinct()
                .toList();

        Map<Long, ConsultancyPayment> paymentsById = new HashMap<>();

        paymentRepository.findAllById(paymentIds)
                .forEach(payment ->
                        paymentsById.put(payment.getId(), payment)
                );

        List<Long> interviewIds = paymentsById.values().stream()
                .map(ConsultancyPayment::getInterviewId)
                .filter(id -> id != null)
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

        List<Long> candidateIds = placementsByInterviewId.values().stream()
                .map(InterviewPlacement::getCandidateId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, Agreement> candidatesById = new HashMap<>();

        agreementRepository.findAllById(candidateIds)
                .forEach(candidate ->
                        candidatesById.put(candidate.getId(), candidate)
                );

        return transactions.stream()
                .map(transaction -> {
                    ConsultancyPayment payment =
                            paymentsById.get(transaction.getPaymentId());

                    if (payment == null || payment.getInterviewId() == null) {
                        return null;
                    }

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
                            transaction.getId(),
                            "—",
                            "Consultancy",
                            payerName,
                            transaction.getAmount(),
                            transaction.getPaymentDate(),
                            transaction.getPaymentGateway()
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
