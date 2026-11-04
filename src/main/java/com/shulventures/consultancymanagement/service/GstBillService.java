package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.gst.GstBillResponse;
import com.shulventures.consultancymanagement.repository.GstBillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GstBillService {

    private final GstBillRepository gstBillRepository;

    @Transactional(readOnly = true)
    public List<GstBillResponse> getEligibleCompanyBills() {
        return gstBillRepository.findEligibleCompanyBills();
    }
}
