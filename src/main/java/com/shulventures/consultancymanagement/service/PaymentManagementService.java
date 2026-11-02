package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.payment.DuePaymentDetailResponse;
import com.shulventures.consultancymanagement.dto.payment.DuePaymentUpdateRequest;
import com.shulventures.consultancymanagement.entity.ConsultancyPayment;
import com.shulventures.consultancymanagement.repository.ConsultancyPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentManagementService {

    private final ConsultancyPaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public DuePaymentDetailResponse getPayment(Long paymentId) {
        return toResponse(findPayment(paymentId));
    }

    @Transactional
    public DuePaymentDetailResponse updatePayment(
            Long paymentId,
            DuePaymentUpdateRequest request
    ) {
        ConsultancyPayment payment = findPayment(paymentId);

        if ("defaulted".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalArgumentException(
                    "A defaulted payment cannot be updated from Due Payments."
            );
        }

        BigDecimal total = zeroIfNull(payment.getTotalAmount());
        BigDecimal paid = request.paidAmount()
                .setScale(2, RoundingMode.HALF_UP);

        if (paid.compareTo(total) > 0) {
            throw new IllegalArgumentException(
                    "Paid amount cannot exceed the total amount."
            );
        }

        String gateway = request.paymentGateway().trim();
        if ("Other".equalsIgnoreCase(gateway)) {
            throw new IllegalArgumentException(
                    "Enter the name of the other payment gateway."
            );
        }

        BigDecimal tds = request.tdsAmount()
                .setScale(2, RoundingMode.HALF_UP);
        boolean tdsPaid = Boolean.TRUE.equals(request.tdsPaid());

        BigDecimal tdsCredit = tdsPaid ? BigDecimal.ZERO : tds;
        BigDecimal due = total.subtract(paid)
                .subtract(tdsCredit)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        payment.setPaidAmount(paid);
        payment.setTdsAmount(tds);
        payment.setTdsPaid(tdsPaid);
        payment.setDueAmount(due);
        payment.setPaymentDate(request.paymentDate());
        payment.setDueDate(request.dueDate());
        payment.setPaymentGateway(gateway);

        return toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public void markClientDefaulter(
            String clientId,
            String defaulterNote
    ) {
        List<ConsultancyPayment> payments =
                paymentRepository.findByClientId(clientId);

        if (payments.isEmpty()) {
            throw new IllegalArgumentException(
                    "No payment records found for this client."
            );
        }

        String note = defaulterNote.trim();

        payments.forEach(payment -> {
            payment.setStatus("defaulted");
            payment.setDefaulterNote(note);
        });

        paymentRepository.saveAll(payments);
    }

    private ConsultancyPayment findPayment(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Payment not found.")
                );
    }

    private DuePaymentDetailResponse toResponse(
            ConsultancyPayment payment
    ) {
        BigDecimal total = zeroIfNull(payment.getTotalAmount());
        BigDecimal paid = zeroIfNull(payment.getPaidAmount());
        BigDecimal tds = zeroIfNull(payment.getTdsAmount());

        BigDecimal tdsCredit =
                Boolean.TRUE.equals(payment.getTdsPaid())
                        ? BigDecimal.ZERO
                        : tds;

        BigDecimal due = total.subtract(paid)
                .subtract(tdsCredit)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        return new DuePaymentDetailResponse(
                payment.getId(),
                payment.getClientId(),
                payment.getInterviewId(),
                payment.getPaymentType(),
                total,
                paid,
                due,
                tds,
                payment.getTdsPaid(),
                payment.getPaymentDate(),
                payment.getDueDate(),
                payment.getPaymentGateway()
        );
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }


    @Transactional
    public void reactivateClient(String clientId) {
        List<ConsultancyPayment> payments =
                paymentRepository.findByClientId(clientId);

        List<ConsultancyPayment> defaultedPayments = payments.stream()
                .filter(payment ->
                        "defaulted".equalsIgnoreCase(payment.getStatus())
                )
                .toList();

        if (defaultedPayments.isEmpty()) {
            throw new IllegalArgumentException(
                    "No defaulted payment records found for this client."
            );
        }

        defaultedPayments.forEach(payment -> {
            payment.setStatus("active");
            payment.setDefaulterNote(null);
        });

        paymentRepository.saveAll(defaultedPayments);
    }
}
