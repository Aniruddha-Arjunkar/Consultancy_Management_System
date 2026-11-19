package com.shulventures.consultancymanagement.service;


import com.shulventures.consultancymanagement.entity.Agreement;
import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.ConsultancyPaymentRepository;
import com.shulventures.consultancymanagement.repository.InterviewPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.shulventures.consultancymanagement.entity.AssociateCompany;
import com.shulventures.consultancymanagement.repository.AssociateCompanyRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class PlacementPaymentAmountService {

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");

    private final AgreementRepository agreementRepository;
    private final ConsultancyPaymentRepository paymentRepository;
    private final InterviewPlacementRepository placementRepository;
    private final AssociateCompanyRepository companyRepository;

    @Transactional
    public void updateCandidateBaseAmount(
            Long candidateId,
            Long paymentId,
            BigDecimal requestedBaseAmount
    ) {
        if (!agreementRepository.existsById(candidateId)) {
            throw new IllegalArgumentException("Candidate not found.");
        }

        ConsultancyPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Payment not found.")
                );

        if (!String.valueOf(candidateId).equals(
                payment.getClientId() == null ? null : payment.getClientId().trim()
        )) {
            throw new IllegalArgumentException(
                    "This payment does not belong to the candidate."
            );
        }

        if (!"Candidate Pay".equalsIgnoreCase(payment.getPaymentType())) {
            throw new IllegalArgumentException(
                    "Only Candidate Pay amounts can be edited from this page."
            );
        }

        if (payment.getInterviewId() == null) {
            throw new IllegalArgumentException(
                    "This payment is not linked to a placement."
            );
        }

        InterviewPlacement placement = placementRepository
                .findById(payment.getInterviewId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Placement not found.")
                );

        if (!candidateId.equals(placement.getCandidateId())) {
            throw new IllegalArgumentException(
                    "This placement does not belong to the candidate."
            );
        }

        if ("defaulted".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalArgumentException(
                    "A defaulted payment amount cannot be changed."
            );
        }

        BigDecimal newBaseAmount =
                requestedBaseAmount.setScale(2, RoundingMode.HALF_UP);

        // A non-null placement GST amount means GST was enabled for this payer.
        boolean gstEnabled = placement.getCandidateGstAmount() != null;

        BigDecimal newGstAmount = gstEnabled
                ? newBaseAmount.multiply(GST_RATE)
                .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        BigDecimal newTotalAmount = newBaseAmount
                .add(newGstAmount)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal paidAmount = zeroIfNull(payment.getPaidAmount());
        if (newTotalAmount.compareTo(paidAmount) < 0) {
            throw new IllegalArgumentException(
                    "The new total amount cannot be less than the amount already paid."
            );
        }

        BigDecimal tdsAmount = zeroIfNull(payment.getTdsAmount());
        if (tdsAmount.compareTo(newGstAmount) > 0) {
            throw new IllegalArgumentException(
                    "The existing TDS amount cannot exceed the recalculated GST amount."
            );
        }

        BigDecimal newDueAmount = newTotalAmount
                .subtract(paidAmount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        placement.setCandidatePayAmount(newBaseAmount);
        placement.setCandidateGstAmount(gstEnabled ? newGstAmount : null);

        payment.setTotalAmount(newTotalAmount);
        payment.setDueAmount(newDueAmount);

        placementRepository.save(placement);
        paymentRepository.save(payment);
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }


    @Transactional
    public void updateCompanyBaseAmount(
            Long companyId,
            Long paymentId,
            BigDecimal requestedBaseAmount
    ) {
        AssociateCompany company = companyRepository.findById(companyId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Associate company not found.")
                );

        ConsultancyPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Payment not found.")
                );

        if (payment.getPaymentType() == null
                || !"Company Pay".equalsIgnoreCase(payment.getPaymentType().trim())) {
            throw new IllegalArgumentException(
                    "Only Company Pay amounts can be edited from this page."
            );
        }

        if (payment.getInterviewId() == null) {
            throw new IllegalArgumentException(
                    "This payment is not linked to a placement."
            );
        }

        InterviewPlacement placement = placementRepository
                .findById(payment.getInterviewId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Placement not found.")
                );

        if (placement.getCompanyName() == null
                || !company.getCompanyName().trim()
                .equalsIgnoreCase(placement.getCompanyName().trim())) {
            throw new IllegalArgumentException(
                    "This payment does not belong to the associate company."
            );
        }

        // Company Pay records store the candidate ID in clientId.
        if (!String.valueOf(placement.getCandidateId()).equals(
                payment.getClientId() == null ? null : payment.getClientId().trim()
        )) {
            throw new IllegalArgumentException(
                    "The payment and placement do not match."
            );
        }

        if ("defaulted".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalArgumentException(
                    "A defaulted payment amount cannot be changed."
            );
        }

        BigDecimal newBaseAmount =
                requestedBaseAmount.setScale(2, RoundingMode.HALF_UP);

        boolean gstEnabled = placement.getCompanyGstAmount() != null;

        BigDecimal newGstAmount = gstEnabled
                ? newBaseAmount.multiply(GST_RATE)
                .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        BigDecimal newTotalAmount = newBaseAmount
                .add(newGstAmount)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal paidAmount = zeroIfNull(payment.getPaidAmount());
        if (newTotalAmount.compareTo(paidAmount) < 0) {
            throw new IllegalArgumentException(
                    "The new total amount cannot be less than the amount already paid."
            );
        }

        BigDecimal tdsAmount = zeroIfNull(payment.getTdsAmount());
        if (tdsAmount.compareTo(newGstAmount) > 0) {
            throw new IllegalArgumentException(
                    "The existing TDS amount cannot exceed the recalculated GST amount."
            );
        }

        BigDecimal settledAmount = paidAmount.add(tdsAmount);
        if (newTotalAmount.compareTo(settledAmount) < 0) {
            throw new IllegalArgumentException(
                    "The new total amount cannot be less than the paid amount plus TDS."
            );
        }

        BigDecimal newDueAmount = newTotalAmount
                .subtract(paidAmount)
                .subtract(tdsAmount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        placement.setCompanyPayAmount(newBaseAmount);
        placement.setCompanyGstAmount(gstEnabled ? newGstAmount : null);

        payment.setTotalAmount(newTotalAmount);
        payment.setDueAmount(newDueAmount);

        placementRepository.save(placement);
        paymentRepository.save(payment);
    }
}
