package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.associate.AssociateCompanyCandidateResponse;
import com.shulventures.consultancymanagement.entity.Agreement;
import com.shulventures.consultancymanagement.entity.AssociateCompany;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.AssociateCompanyRepository;
import com.shulventures.consultancymanagement.repository.InterviewPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AssociateCompanyCandidateService {

    private static final Set<String> DISPLAYED_STATUSES = Set.of(
            "SCHEDULED",
            "RESCHEDULED",
            "COMPLETED",
            "PLACED",
            "REJECTED"
    );

    private final AssociateCompanyRepository companyRepository;
    private final InterviewPlacementRepository placementRepository;
    private final AgreementRepository agreementRepository;

    @Transactional(readOnly = true)
    public List<AssociateCompanyCandidateResponse> getCandidateDetails(
            Long companyId
    ) {
        AssociateCompany company = companyRepository.findById(companyId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Associate company not found.")
                );

        List<InterviewPlacement> placements =
                placementRepository
                        .findByCompanyNameIgnoreCaseOrderByInterviewDateAscInterviewTimeAscInterviewIdAsc(
                                company.getCompanyName()
                        )
                        .stream()
                        .filter(placement ->
                                DISPLAYED_STATUSES.contains(
                                        normalizeStatus(placement.getInterviewStatus())
                                )
                        )
                        .toList();

        if (placements.isEmpty()) {
            return List.of();
        }

        List<Long> candidateIds = placements.stream()
                .map(InterviewPlacement::getCandidateId)
                .distinct()
                .toList();

        Map<Long, Agreement> candidatesById = new HashMap<>();
        agreementRepository.findAllById(candidateIds).forEach(candidate ->
                candidatesById.put(candidate.getId(), candidate)
        );

        return placements.stream()
                .map(placement -> {
                    Agreement candidate =
                            candidatesById.get(placement.getCandidateId());

                    String candidateName = firstNonBlank(
                            candidate == null ? null : candidate.getName(),
                            placement.getCandidateName(),
                            "Unknown Candidate"
                    );

                    return new AssociateCompanyCandidateResponse(
                            placement.getInterviewId(),
                            placement.getCandidateId(),
                            candidateName,
                            placement.getInterviewDate(),
                            placement.getPosition(),
                            placement.getInterviewTime(),
                            placement.getInterviewStatus(),
                            placement.getRemark(),
                            placement.getSalaryPackage(),
                            placement.getJoiningDate(),
                            placement.getHrName(),
                            placement.getRejectionReason()
                    );
                })
                .toList();
    }

    private String normalizeStatus(String status) {
        return status == null
                ? ""
                : status.trim().toUpperCase(Locale.ROOT);
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
