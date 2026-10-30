package com.shulventures.consultancymanagement.dto.interview;
import java.util.List;

public record InterviewUpdateDetailsResponse(
        InterviewScheduleResponse current,
        List<InterviewScheduleResponse> rounds
) {
}