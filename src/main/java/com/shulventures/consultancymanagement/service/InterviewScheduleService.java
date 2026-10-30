package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.interview.CreateInterviewScheduleRequest;
import com.shulventures.consultancymanagement.dto.interview.InterviewRequirementOptionResponse;
import com.shulventures.consultancymanagement.dto.interview.InterviewScheduleResponse;
import com.shulventures.consultancymanagement.entity.Agreement;
import com.shulventures.consultancymanagement.entity.CurrentRequirement;
import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import com.shulventures.consultancymanagement.repository.AgreementRepository;
import com.shulventures.consultancymanagement.repository.CurrentRequirementRepository;
import com.shulventures.consultancymanagement.repository.InterviewPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.shulventures.consultancymanagement.dto.interview.InterviewUpdateDetailsResponse;
import com.shulventures.consultancymanagement.dto.interview.UpdateInterviewRoundRequest;

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.List;


@Service
@RequiredArgsConstructor
public class InterviewScheduleService {

    private final InterviewPlacementRepository interviewRepository;
    private final AgreementRepository agreementRepository;
    private final CurrentRequirementRepository requirementRepository;

    @Transactional(readOnly = true)
    public List<InterviewRequirementOptionResponse> getCurrentRequirements() {
        return requirementRepository
                .findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toRequirementOption)
                .toList();
    }

    @Transactional
    public InterviewScheduleResponse schedule(
            CreateInterviewScheduleRequest request
    ) {
        Agreement candidate = agreementRepository.findById(request.candidateId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
                );

        if ("Blacklisted".equals(candidate.getStatus())) {
            throw new IllegalArgumentException(
                    "A blacklisted candidate cannot be scheduled for interview."
            );
        }

        CurrentRequirement requirement =
                requirementRepository.findById(request.requirementId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Current requirement not found."
                                )
                        );

        InterviewPlacement placement = new InterviewPlacement();
        placement.setCandidateId(candidate.getId());
        placement.setCandidateName(candidate.getName());
        placement.setCompanyName(
                requirement.getAssociateCompany().getCompanyName()
        );
        placement.setPosition(requirement.getJobProfile());
        placement.setInterviewDate(request.interviewDate());
        placement.setInterviewTime(request.interviewTime());
        placement.setInterviewRound(request.interviewRound());
        placement.setInterviewStatus("Scheduled");
        placement.setHrName(request.hrName().trim());
        placement.setRemark(
                request.remark() == null ? "" : request.remark().trim()
        );

        return toResponse(interviewRepository.save(placement));
    }

    @Transactional(readOnly = true)
    public List<InterviewScheduleResponse> getScheduledInterviews() {
        Map<Long, InterviewPlacement> latestByCandidate = new HashMap<>();

        for (InterviewPlacement interview : interviewRepository.findAll()) {
            InterviewPlacement existing =
                    latestByCandidate.get(interview.getCandidateId());

            int interviewRound = interview.getInterviewRound() == null
                    ? 0
                    : interview.getInterviewRound();

            int existingRound = existing == null
                    || existing.getInterviewRound() == null
                    ? 0
                    : existing.getInterviewRound();

            boolean isLaterRound = existing == null
                    || interviewRound > existingRound;

            boolean isNewerRecordAtSameRound = existing != null
                    && interviewRound == existingRound
                    && interview.getInterviewId() > existing.getInterviewId();

            if (isLaterRound || isNewerRecordAtSameRound) {
                latestByCandidate.put(interview.getCandidateId(), interview);
            }
        }

        Set<String> visibleStatuses =
                Set.of("Scheduled", "Rescheduled", "Completed");

        return latestByCandidate.values().stream()
                .filter(interview ->
                        visibleStatuses.contains(interview.getInterviewStatus())
                )
                .sorted(
                        Comparator.comparing(InterviewPlacement::getInterviewDate)
                                .thenComparing(InterviewPlacement::getInterviewTime)
                )
                .map(this::toResponse)
                .toList();
    }

    private InterviewRequirementOptionResponse toRequirementOption(
            CurrentRequirement requirement
    ) {
        return new InterviewRequirementOptionResponse(
                requirement.getId(),
                requirement.getAssociateCompany().getCompanyName(),
                requirement.getJobProfile()
        );
    }

    private InterviewScheduleResponse toResponse(
            InterviewPlacement placement
    ) {
        return new InterviewScheduleResponse(
                placement.getInterviewId(),
                placement.getCandidateId(),
                placement.getCompanyName(),
                placement.getPosition(),
                placement.getJoiningDate(),
                placement.getInterviewDate(),
                placement.getInterviewTime(),
                placement.getSalaryPackage(),
                placement.getInterviewStatus(),
                placement.getRejectionReason(),
                placement.getInterviewRound(),
                placement.getRemark(),
                placement.getHrName(),
                placement.getCandidateName(),
                placement.getPaymentType(),
                placement.getCompanyPayAmount(),
                placement.getCandidatePayAmount(),
                placement.getCompanyPayDate(),
                placement.getCandidatePayDate(),
                placement.getCompanyGstAmount(),
                placement.getCandidateGstAmount(),
                placement.getPayRemark()
        );
    }

    @Transactional(readOnly = true)
    public InterviewUpdateDetailsResponse getUpdateDetails(Long interviewId) {
        InterviewPlacement current = findInterview(interviewId);

        List<InterviewScheduleResponse> rounds =
                interviewRepository
                        .findByCandidateIdAndCompanyNameOrderByInterviewRoundAscInterviewIdAsc(
                                current.getCandidateId(),
                                current.getCompanyName()
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return new InterviewUpdateDetailsResponse(
                toResponse(current),
                rounds
        );
    }

    @Transactional
    public InterviewScheduleResponse reschedule(
            Long interviewId,
            UpdateInterviewRoundRequest request
    ) {
        InterviewPlacement interview = findInterview(interviewId);
        requireInProcess(interview);

        interview.setInterviewDate(request.interviewDate());
        interview.setInterviewTime(request.interviewTime());
        interview.setHrName(request.hrName().trim());
        interview.setRemark(textOrEmpty(request.remark()));
        interview.setInterviewStatus("Rescheduled");

        return toResponse(interviewRepository.save(interview));
    }

    @Transactional
    public InterviewScheduleResponse complete(Long interviewId) {
        InterviewPlacement interview = findInterview(interviewId);
        requireInProcess(interview);

        interview.setInterviewStatus("Completed");
        return toResponse(interviewRepository.save(interview));
    }

    @Transactional
    public InterviewScheduleResponse scheduleNextRound(
            Long interviewId,
            UpdateInterviewRoundRequest request
    ) {
        InterviewPlacement previousRound = findInterview(interviewId);

        if (!"Completed".equals(previousRound.getInterviewStatus())) {
            throw new IllegalArgumentException(
                    "Complete the current round before scheduling the next round."
            );
        }

        InterviewPlacement nextRound = new InterviewPlacement();
        nextRound.setCandidateId(previousRound.getCandidateId());
        nextRound.setCandidateName(previousRound.getCandidateName());
        nextRound.setCompanyName(previousRound.getCompanyName());
        nextRound.setPosition(previousRound.getPosition());
        nextRound.setInterviewRound(previousRound.getInterviewRound() + 1);
        nextRound.setInterviewDate(request.interviewDate());
        nextRound.setInterviewTime(request.interviewTime());
        nextRound.setHrName(request.hrName().trim());
        nextRound.setRemark(textOrEmpty(request.remark()));
        nextRound.setInterviewStatus("Scheduled");

        return toResponse(interviewRepository.save(nextRound));
    }

    @Transactional
    public InterviewScheduleResponse setFinalDecision(
            Long interviewId,
            String status
    ) {
        if (!"Placed".equals(status) && !"Rejected".equals(status)) {
            throw new IllegalArgumentException(
                    "Interview status must be Placed or Rejected."
            );
        }

        InterviewPlacement interview = findInterview(interviewId);
        interview.setInterviewStatus(status);

        return toResponse(interviewRepository.save(interview));
    }

    private InterviewPlacement findInterview(Long interviewId) {
        return interviewRepository.findById(interviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Interview not found.")
                );
    }

    private void requireInProcess(InterviewPlacement interview) {
        if (!"Scheduled".equals(interview.getInterviewStatus())
                && !"Rescheduled".equals(interview.getInterviewStatus())) {
            throw new IllegalArgumentException(
                    "Only a Scheduled or Rescheduled interview can be changed."
            );
        }
    }

    private String textOrEmpty(String value) {
        return value == null ? "" : value;
    }
}
