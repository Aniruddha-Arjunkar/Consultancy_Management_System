package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.InterviewPlacement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewPlacementRepository
        extends JpaRepository<InterviewPlacement, Long> {

    List<InterviewPlacement>
    findByInterviewStatusInOrderByInterviewDateAscInterviewTimeAsc(
            List<String> statuses
    );

    List<InterviewPlacement>
    findByCandidateIdAndCompanyNameOrderByInterviewRoundAscInterviewIdAsc(
            Long candidateId,
            String companyName
    );
}
