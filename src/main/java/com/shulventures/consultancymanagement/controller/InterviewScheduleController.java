package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.interview.CreateInterviewScheduleRequest;
import com.shulventures.consultancymanagement.dto.interview.InterviewRequirementOptionResponse;
import com.shulventures.consultancymanagement.dto.interview.InterviewScheduleResponse;
import com.shulventures.consultancymanagement.service.InterviewScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.shulventures.consultancymanagement.dto.interview.InterviewDecisionRequest;
import com.shulventures.consultancymanagement.dto.interview.InterviewUpdateDetailsResponse;
import com.shulventures.consultancymanagement.dto.interview.UpdateInterviewRoundRequest;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewScheduleController {

    private final InterviewScheduleService interviewScheduleService;

    @GetMapping("/requirements")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'INTERVIEW_SCHEDULE')"
    )
    public List<InterviewRequirementOptionResponse> getCurrentRequirements() {
        return interviewScheduleService.getCurrentRequirements();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'INTERVIEW_SCHEDULE')"
    )
    public InterviewScheduleResponse scheduleInterview(
            @Valid @RequestBody CreateInterviewScheduleRequest request
    ) {
        return interviewScheduleService.schedule(request);
    }

    @GetMapping
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'INTERVIEW_SCHEDULE')"
    )
    public List<InterviewScheduleResponse> getScheduledInterviews() {
        return interviewScheduleService.getScheduledInterviews();
    }

    @GetMapping("/{id}/edit-details")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'INTERVIEW_SCHEDULE')"
    )
    public InterviewUpdateDetailsResponse getUpdateDetails(
            @PathVariable Long id
    ) {
        return interviewScheduleService.getUpdateDetails(id);
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'INTERVIEW_SCHEDULE')"
    )
    public InterviewScheduleResponse reschedule(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInterviewRoundRequest request
    ) {
        return interviewScheduleService.reschedule(id, request);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'INTERVIEW_SCHEDULE')"
    )
    public InterviewScheduleResponse complete(@PathVariable Long id) {
        return interviewScheduleService.complete(id);
    }

    @PostMapping("/{id}/next-round")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'INTERVIEW_SCHEDULE')"
    )
    public InterviewScheduleResponse scheduleNextRound(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInterviewRoundRequest request
    ) {
        return interviewScheduleService.scheduleNextRound(id, request);
    }

    @PatchMapping("/{id}/decision")
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'CONSULTANCY', 'INTERVIEW_SCHEDULE')"
    )
    public InterviewScheduleResponse setFinalDecision(
            @PathVariable Long id,
            @Valid @RequestBody InterviewDecisionRequest request
    ) {
        return interviewScheduleService.setFinalDecision(id, request.status());
    }
}
