import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import currentRequirementService from "./../../../../services/currentRequirementService";
import "./CloseRequirementDetail.css";

const CloseRequirementDetail = () => {
    const { requirementId } = useParams();
    const navigate = useNavigate();
    const [requirement, setRequirement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadRequirement = async () => {
            try {
                const data =
                    await currentRequirementService.getClosedRequirementById(
                        requirementId
                    );

                if (active) setRequirement(data);
            } catch (error) {
                if (active) {
                    window.alert(
                        error.message ||
                            "Could not load closed requirement details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadRequirement();

        return () => {
            active = false;
        };
    }, [requirementId]);

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading closed requirement details...</p>
                </section>
            </section>
        );
    }

    if (!requirement) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Closed requirement not found.</p>
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/consultancy/closed-requirement")
                        }
                    >
                        ← Back to Closed Requirements
                    </button>
                </section>
            </section>
        );
    }

    const fields = [
        ["Company Name", requirement.companyName],
        ["Location", requirement.location],
        ["Education", requirement.education],
        ["Job Profile", requirement.jobProfile],
        ["Position Level", requirement.positionLevel],
        ["Years of Experience", requirement.yearsOfExperience],
        ["Number of Positions", requirement.noOfPositions],
        ["Skills Required", requirement.skillsRequired],
        ["Open Date", requirement.openDate],
        ["Close Date", requirement.closeDate],
        ["Selected Candidates", requirement.selectCandidate ?? 0],
        ["Job Description", requirement.jobDescription],
    ];

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="closed-requirement-detail">
                    <header className="closed-requirement-detail-header">
                        <h1>View Requirement Details</h1>
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/consultancy/closed-requirement")
                            }
                        >
                            ← Back to List
                        </button>
                    </header>

                    <div className="closed-requirement-detail-grid">
                        {fields.map(([label, value]) => (
                            <div
                                className="closed-requirement-detail-field"
                                key={label}
                            >
                                <strong>{label}</strong>
                                <span>{value || "—"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </section>
    );
};
export default CloseRequirementDetail;