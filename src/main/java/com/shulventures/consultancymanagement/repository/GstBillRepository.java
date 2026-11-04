package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.dto.gst.GstBillResponse;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GstBillRepository extends JpaRepository<InterviewPlacement, Long> {

    @Query("""
            SELECT new com.shulventures.consultancymanagement.dto.gst.GstBillResponse(
                p.interviewId,
                a.id,
                CONCAT(CONCAT(a.companyName, ' ('), CONCAT(COALESCE(p.candidateName, 'Candidate'), ')')),
                a.phone,
                a.shippingAddress,
                p.companyPayDate,
                pay.totalAmount,
                pay.paidAmount
            )
            FROM InterviewPlacement p
            JOIN AssociateCompany a
                ON LOWER(TRIM(a.companyName)) = LOWER(TRIM(p.companyName))
            JOIN ConsultancyPayment pay
                ON pay.interviewId = p.interviewId
                AND pay.paymentType = 'Company Pay'
            WHERE p.interviewStatus = 'Placed'
                AND p.paymentType IN ('Company Pay', 'Both Pay')
                AND p.companyGstAmount > 0
                AND a.gstNumber IS NOT NULL
                AND TRIM(a.gstNumber) <> ''
                AND a.shippingAddress IS NOT NULL
                AND TRIM(a.shippingAddress) <> ''
            ORDER BY p.companyPayDate DESC, p.interviewId DESC
            """)
    List<GstBillResponse> findEligibleCompanyBills();
}
