package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.payment.CandidatePaymentDetailsResponse;
import com.shulventures.consultancymanagement.dto.payment.CandidatePaymentRowResponse;
import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.ConsultancyPaymentRepository;
import com.shulventures.consultancymanagement.repository.InterviewPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CandidatePaymentService {

    private final AgreementRepository agreementRepository;
    private final ConsultancyPaymentRepository paymentRepository;
    private final InterviewPlacementRepository placementRepository;

    @Transactional(readOnly = true)
    public CandidatePaymentDetailsResponse getCandidatePayments(Long candidateId) {
        if (!agreementRepository.existsById(candidateId)) {
            throw new IllegalArgumentException("Candidate not found.");
        }

        // InterviewScheduleService stores the candidate ID in clientId as text.
        List<ConsultancyPayment> allPayments =
                paymentRepository.findByClientId(String.valueOf(candidateId));

        // Defaulter marking applies to all records for this client.
        boolean isDefaulter = allPayments.stream()
                .anyMatch(payment ->
                        "defaulted".equalsIgnoreCase(payment.getStatus())
                );

        // Match the senior page: if any Company Pay record exists, hide all
        // Company Pay rows from this candidate's payment section.
        boolean hasCompanyPay = allPayments.stream()
                .anyMatch(this::isCompanyPay);

        List<ConsultancyPayment> visiblePayments = allPayments.stream()
                .filter(payment -> !hasCompanyPay || !isCompanyPay(payment))
                .sorted(Comparator.comparing(
                        ConsultancyPayment::getId,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();

        List<Long> interviewIds = allPayments.stream()
                .map(ConsultancyPayment::getInterviewId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, InterviewPlacement> placementsByInterviewId = new HashMap<>();

        placementRepository.findAllById(interviewIds).forEach(placement ->
                placementsByInterviewId.put(placement.getInterviewId(), placement)
        );

        BigDecimal totalPaid = visiblePayments.stream()
                .map(payment -> zeroIfNull(payment.getPaidAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CandidatePaymentRowResponse> rows = visiblePayments.stream()
                .map(payment -> {

                    BigDecimal total = zeroIfNull(payment.getTotalAmount());
                    BigDecimal paid = zeroIfNull(payment.getPaidAmount());

                    InterviewPlacement placement = payment.getInterviewId() == null
                            ? null
                            : placementsByInterviewId.get(payment.getInterviewId());

                    boolean isCandidatePay = payment.getPaymentType() != null
                            && "Candidate Pay".equalsIgnoreCase(payment.getPaymentType().trim());

                    boolean belongsToCandidate = placement != null
                            && candidateId.equals(placement.getCandidateId());

                    boolean editable = isCandidatePay && belongsToCandidate;
                    boolean gstEnabled = editable
                            && placement.getCandidateGstAmount() != null;

                    BigDecimal baseAmount = editable
                            ? zeroIfNull(placement.getCandidatePayAmount())
                            : BigDecimal.ZERO;

                    BigDecimal gstAmount = gstEnabled
                            ? zeroIfNull(placement.getCandidateGstAmount())
                            : null;

                    return new CandidatePaymentRowResponse(
                            payment.getId(),
                            payment.getPaymentType(),
                            baseAmount,
                            gstAmount,
                            gstEnabled,
                            editable,
                            total,
                            paid,
                            payment.getPaymentDate(),
                            payment.getPaymentGateway(),
                            getPaymentStatus(total, paid)
                    );})
                .toList();

        return new CandidatePaymentDetailsResponse(
                isDefaulter ? "DEFAULTER" : "ACTIVE",
                totalPaid,
                rows
        );
    }

    private boolean isCompanyPay(ConsultancyPayment payment) {
        return payment.getPaymentType() != null
                && "Company Pay".equalsIgnoreCase(payment.getPaymentType().trim());
    }

    private String getPaymentStatus(BigDecimal total, BigDecimal paid) {
        // Avoid treating a zero-value payment as Paid.
        if (total.signum() <= 0) {
            return "Unpaid";
        }

        if (paid.compareTo(total) >= 0) {
            return "Paid";
        }

        if (paid.signum() > 0) {
            return "Partial";
        }

        return "Unpaid";
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
