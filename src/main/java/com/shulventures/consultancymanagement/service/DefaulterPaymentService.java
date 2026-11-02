package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.payment.DefaulterPaymentResponse;
import com.shulventures.consultancymanagement.entity.Agreement;
import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.ConsultancyPaymentRepository;
import com.shulventures.consultancymanagement.repository.InterviewPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DefaulterPaymentService {

    private final ConsultancyPaymentRepository paymentRepository;
    private final InterviewPlacementRepository placementRepository;
    private final AgreementRepository agreementRepository;

    @Transactional(readOnly = true)
    public List<DefaulterPaymentResponse> getDefaulterPayments() {
        List<ConsultancyPayment> payments =
                paymentRepository.findByStatusOrderByDueDateAscIdAsc("defaulted");

        List<Long> interviewIds = payments.stream()
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

                    BigDecimal totalAmount =
                            zeroIfNull(payment.getTotalAmount());
                    BigDecimal paidAmount =
                            zeroIfNull(payment.getPaidAmount());
                    BigDecimal tdsAmount =
                            zeroIfNull(payment.getTdsAmount());

                    BigDecimal unpaidTds =
                            Boolean.FALSE.equals(payment.getTdsPaid())
                                    ? tdsAmount
                                    : BigDecimal.ZERO;

                    BigDecimal dueAmount = totalAmount
                            .subtract(paidAmount)
                            .subtract(unpaidTds)
                            .max(BigDecimal.ZERO)
                            .setScale(2, RoundingMode.HALF_UP);

                    if (dueAmount.signum() <= 0) {
                        return null;
                    }

                    return new DefaulterPaymentResponse(
                            payment.getId(),
                            payment.getClientId(),
                            payerName,
                            totalAmount,
                            paidAmount,
                            dueAmount,
                            payment.getDueDate(),
                            payment.getDefaulterNote()
                    );
                })
                .filter(response -> response != null)
                .toList();
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
}
