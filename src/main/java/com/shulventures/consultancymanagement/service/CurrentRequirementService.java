package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.requirement.CreateCurrentRequirementRequest;
import com.shulventures.consultancymanagement.dto.requirement.CurrentRequirementResponse;
import com.shulventures.consultancymanagement.dto.requirement.UpdateCurrentRequirementRequest;
import com.shulventures.consultancymanagement.entity.AssociateCompany;
import com.shulventures.consultancymanagement.entity.ClosedRequirement;
import com.shulventures.consultancymanagement.entity.CurrentRequirement;
import com.shulventures.consultancymanagement.repository.AssociateCompanyRepository;
import com.shulventures.consultancymanagement.repository.ClosedRequirementRepository;
import com.shulventures.consultancymanagement.repository.CurrentRequirementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shulventures.consultancymanagement.dto.requirement.AssociateCompanyOptionResponse;
import java.util.List;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CurrentRequirementService {

    private final CurrentRequirementRepository requirementRepository;
    private final AssociateCompanyRepository associateCompanyRepository;
    private final ClosedRequirementRepository closedRequirementRepository;


    @Transactional(readOnly = true)
    public List<AssociateCompanyOptionResponse> getAssociateCompanyOptions() {
        return associateCompanyRepository.findAllByOrderByIdDesc()
                .stream()
                .map(company -> new AssociateCompanyOptionResponse(
                        company.getId(),
                        company.getCompanyName(),
                        company.getLocation()
                ))
                .toList();
    }


    @Transactional
    public CurrentRequirementResponse create(
            CreateCurrentRequirementRequest request
    ) {
        AssociateCompany company =
                associateCompanyRepository.findById(
                        request.associateCompanyId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Associate company not found."
                        )
                );

        String positionLevel = request.positionLevel()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!positionLevel.equals("fresher")
                && !positionLevel.equals("experienced")) {
            throw new IllegalArgumentException(
                    "Position level must be Fresher or Experienced."
            );
        }

        positionLevel = positionLevel.equals("fresher")
                ? "Fresher"
                : "Experienced";

        String yearsOfExperience = null;

        if (positionLevel.equals("Experienced")
                && request.yearsOfExperience() != null
                && !request.yearsOfExperience().isBlank()) {
            yearsOfExperience = request.yearsOfExperience().trim();
        }

        CurrentRequirement requirement = new CurrentRequirement();
        requirement.setAssociateCompany(company);
        requirement.setLocation(request.location().trim());
        requirement.setEducation(request.education().trim());
        requirement.setJobProfile(request.jobProfile().trim());
        requirement.setNoOfPositions(request.noOfPositions());
        requirement.setPositionLevel(positionLevel);
        requirement.setYearsOfExperience(yearsOfExperience);
        requirement.setJobDescription(request.jobDescription().trim());
        requirement.setSkillsRequired(request.skillsRequired().trim());
        requirement.setOpenDate(request.openDate());
        requirement.setCloseDate(null);
        requirement.setSelectCandidate(0);

        CurrentRequirement saved = requirementRepository.save(requirement);
        return toResponse(saved);
    }

    private CurrentRequirementResponse toResponse(
            CurrentRequirement requirement
    ) {
        AssociateCompany company = requirement.getAssociateCompany();

        return new CurrentRequirementResponse(
                requirement.getId(),
                company.getId(),
                company.getCompanyName(),
                requirement.getLocation(),
                requirement.getEducation(),
                requirement.getJobProfile(),
                requirement.getNoOfPositions(),
                requirement.getPositionLevel(),
                requirement.getYearsOfExperience(),
                requirement.getJobDescription(),
                requirement.getSkillsRequired(),
                requirement.getOpenDate(),
                requirement.getCloseDate(),
                requirement.getSelectCandidate()
        );
    }


    @Transactional(readOnly = true)
    public List<CurrentRequirementResponse> getAll() {
        return requirementRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    @Transactional(readOnly = true)
    public CurrentRequirementResponse getById(Long id) {
        CurrentRequirement requirement = requirementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Requirement not found.")
                );

        return toResponse(requirement);
    }


    @Transactional
    public CurrentRequirementResponse update(
            Long id,
            UpdateCurrentRequirementRequest request
    ) {
        CurrentRequirement requirement = requirementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Requirement not found.")
                );

        AssociateCompany company =
                associateCompanyRepository.findById(request.associateCompanyId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Associate company not found."
                                )
                        );

        String positionLevel = request.positionLevel()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!positionLevel.equals("fresher")
                && !positionLevel.equals("experienced")) {
            throw new IllegalArgumentException(
                    "Position level must be Fresher or Experienced."
            );
        }

        positionLevel = positionLevel.equals("fresher")
                ? "Fresher"
                : "Experienced";

        requirement.setAssociateCompany(company);
        requirement.setLocation(request.location().trim());
        requirement.setEducation(request.education().trim());
        requirement.setJobProfile(request.jobProfile().trim());
        requirement.setNoOfPositions(request.noOfPositions());
        requirement.setPositionLevel(positionLevel);
        requirement.setYearsOfExperience(
                positionLevel.equals("Experienced")
                        && request.yearsOfExperience() != null
                        && !request.yearsOfExperience().isBlank()
                        ? request.yearsOfExperience().trim()
                        : null
        );
        requirement.setJobDescription(request.jobDescription().trim());
        requirement.setSkillsRequired(request.skillsRequired().trim());
        requirement.setOpenDate(request.openDate());
        requirement.setCloseDate(
                request.closeDate() == null || request.closeDate().isBlank()
                        ? null
                        : request.closeDate().trim()
        );
        requirement.setSelectCandidate(request.selectCandidate());

        return toResponse(requirementRepository.save(requirement));
    }

    @Transactional
    public void close(Long id) {
        CurrentRequirement requirement = requirementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Requirement not found.")
                );

        ClosedRequirement closed = new ClosedRequirement();
        closed.setId(requirement.getId());
        closed.setCompanyName(
                requirement.getAssociateCompany().getCompanyName()
        );
        closed.setLocation(requirement.getLocation());
        closed.setEducation(requirement.getEducation());
        closed.setJobProfile(requirement.getJobProfile());
        closed.setNoOfPositions(requirement.getNoOfPositions());
        closed.setPositionLevel(requirement.getPositionLevel());
        closed.setYearsOfExperience(requirement.getYearsOfExperience());
        closed.setJobDescription(requirement.getJobDescription());
        closed.setSkillsRequired(requirement.getSkillsRequired());
        closed.setOpenDate(requirement.getOpenDate());
        closed.setCloseDate(requirement.getCloseDate());
        closed.setSelectCandidate(requirement.getSelectCandidate());

        closedRequirementRepository.save(closed);
        requirementRepository.delete(requirement);
    }
}