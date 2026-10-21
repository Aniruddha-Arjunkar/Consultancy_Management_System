package com.shulventures.consultancymanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "tbl_close_requirement")
@Getter
@Setter
@NoArgsConstructor
public class ClosedRequirement {

    @Id
    @Column(name = "Id")
    private Long id;

    @Column(name = "company_name", nullable = false, columnDefinition = "TEXT")
    private String companyName;

    @Column(name = "location", nullable = false, columnDefinition = "TEXT")
    private String location;

    @Column(name = "education", nullable = false, columnDefinition = "TEXT")
    private String education;

    @Column(name = "job_profile", nullable = false, columnDefinition = "TEXT")
    private String jobProfile;

    @Column(name = "no_of_positions", nullable = false)
    private Integer noOfPositions;

    @Column(name = "position_level", nullable = false, length = 100)
    private String positionLevel;

    @Column(name = "years_of_experience", columnDefinition = "TEXT")
    private String yearsOfExperience;

    @Column(name = "job_description", nullable = false, columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "skills_required", nullable = false, columnDefinition = "TEXT")
    private String skillsRequired;

    @Column(name = "open_date")
    private LocalDate openDate;

    @Column(name = "close_date", columnDefinition = "TEXT")
    private String closeDate;

    @Column(name = "select_candidate", nullable = false)
    private Integer selectCandidate;
}