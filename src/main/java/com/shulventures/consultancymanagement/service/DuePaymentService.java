package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.payment.DuePaymentResponse;
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
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DuePaymentService {

    private final ConsultancyPaymentRepository paymentRepository;
    private final InterviewPlacementRepository placementRepository;
    private final AgreementRepository agreementRepository;
    private final AssociateCompanyRepository associateCompanyRepository;

    @Transactional(readOnly = true)
    public List<DuePaymentResponse> getDuePayments() {
        List<ConsultancyPayment> payments =
                paymentRepository.findByStatusNotOrderByDueDateAscIdAsc(
                        "defaulted"
                );

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

        Map<String, AssociateCompany> companiesByName = new HashMap<>();

        associateCompanyRepository.findAll().forEach(company -> {
            String key = normalize(company.getCompanyName());
            if (!key.isEmpty()) {
                companiesByName.putIfAbsent(key, company);
            }
        });

        List<DuePaymentResponse> duePayments = new ArrayList<>();

        for (ConsultancyPayment payment : payments) {
            if (payment.getInterviewId() == null) continue;

            String paymentType = payment.getPaymentType();
            boolean companyPay = "Company Pay".equals(paymentType);
            boolean candidatePay = "Candidate Pay".equals(paymentType);

            // This page lists consultancy placement payments only.
            if (!companyPay && !candidatePay) continue;

            InterviewPlacement placement =
                    placementsByInterviewId.get(payment.getInterviewId());

            if (placement == null) continue;

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

            AssociateCompany company =
                    companiesByName.get(normalize(companyName));

            String payerName = companyPay
                    ? companyName + " (" + candidateName + ")"
                    : candidateName + " (" + companyName + ")";

            String payerPhone = companyPay
                    ? (company == null ? null : company.getPhone())
                    : (candidate == null ? null : candidate.getPhone());

            BigDecimal totalAmount = zeroIfNull(payment.getTotalAmount());
            BigDecimal paidAmount = zeroIfNull(payment.getPaidAmount());
            BigDecimal tdsAmount = zeroIfNull(payment.getTdsAmount());

            // Matches the senior page's TDS rule.
            BigDecimal tdsCredit =
                    Boolean.FALSE.equals(payment.getTdsPaid())
                            ? tdsAmount
                            : BigDecimal.ZERO;

            BigDecimal dueAmount = totalAmount
                    .subtract(paidAmount)
                    .subtract(tdsCredit)
                    .max(BigDecimal.ZERO)
                    .setScale(2, RoundingMode.HALF_UP);

            // Fully paid records disappear from this page.
            if (dueAmount.signum() <= 0) continue;

            duePayments.add(new DuePaymentResponse(
                    payment.getId(),
                    payment.getClientId(),
                    "—",
                    "Consultancy",
                    payerName,
                    firstNonBlank(payerPhone, "—"),
                    totalAmount,
                    paidAmount,
                    dueAmount,
                    payment.getDueDate()
            ));
        }

        return duePayments;
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

    private String normalize(String value) {
        return value == null
                ? ""
                : value.trim().toLowerCase(Locale.ROOT);
    }
}
