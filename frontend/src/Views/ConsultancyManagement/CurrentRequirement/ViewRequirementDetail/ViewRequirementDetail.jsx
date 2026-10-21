import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import currentRequirementService from "../../../../services/currentRequirementService";
import "./ViewRequirementDetail.css";

const DetailRow = ({ label, value }) => (
    <div className="requirement-detail-row">
        <span className="requirement-detail-label">{label}</span>
        <span className="requirement-detail-value">{value || "—"}</span>
    </div>
);

const ViewRequirementDetail = () => {
    const { requirementId } = useParams();
    const navigate = useNavigate();
    const [requirement, setRequirement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadRequirement = async () => {
            try {
                const data =
                    await currentRequirementService.getCurrentRequirementById(
                        requirementId
                    );

                if (active) {
                    setRequirement(data);
                }
            } catch (error) {
                if (active) {
                    window.alert(
                        error.message || "Unable to load requirement details."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        if (!requirementId) {
            window.alert("Requirement ID is missing.");
            setLoading(false);
            return undefined;
        }

        loadRequirement();

        return () => {
            active = false;
        };
    }, [requirementId]);

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="requirement-detail-card">
                        Loading requirement details...
                    </div>
                </section>
            </section>
        );
    }

    if (!requirement) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="requirement-detail-card">
                        <p>Requirement details could not be loaded.</p>
                        <button
                            type="button"
                            className="requirement-detail-back"
                            onClick={() =>
                                navigate("/consultancy/view-requirement")
                            }
                        >
                            ← Back to Requirements
                        </button>
                    </div>
                </section>
            </section>
        );
    }

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="requirement-detail-page">
                    <header className="requirement-detail-header">
                        <div>
                            <h1>📋 Requirement Details</h1>
                            <p>Full details for this current job requirement</p>
                        </div>

                        <div className="requirement-detail-header-actions">
                            <button
                                type="button"
                                className="requirement-detail-update"
                                onClick={() =>
                                    navigate(`/consultancy/update-requirement/${requirement.id}`)
                                }
                            >
                                ✏️ Update Details
                            </button>

                            <button
                                type="button"
                                className="requirement-detail-back"
                                onClick={() => navigate("/consultancy/view-requirement")}
                            >
                                ← Back
                            </button>
                        </div>
                    </header>

                    <section className="requirement-detail-card">
                        <h2>{requirement.jobProfile || "Job Requirement"}</h2>

                        <div className="requirement-detail-grid">
                            <DetailRow
                                label="Company Name"
                                value={requirement.companyName}
                            />
                            <DetailRow
                                label="Location"
                                value={requirement.location}
                            />
                            <DetailRow
                                label="Position Level"
                                value={requirement.positionLevel}
                            />
                            <DetailRow
                                label="Years of Experience"
                                value={requirement.yearsOfExperience}
                            />
                            <DetailRow
                                label="Number of Positions"
                                value={requirement.noOfPositions}
                            />
                            <DetailRow
                                label="Education"
                                value={requirement.education}
                            />
                            <DetailRow
                                label="Job Profile"
                                value={requirement.jobProfile}
                            />
                            <DetailRow
                                label="Selected Candidates"
                                value={requirement.selectCandidate ?? 0}
                            />
                            <DetailRow
                                label="Open Date"
                                value={requirement.openDate}
                            />
                            <DetailRow
                                label="Close Date"
                                value={requirement.closeDate}
                            />

                        </div>
                        <div className="requirement-detail-description">
                            <h3>Skills Required</h3>
                            <p>{requirement.skillsRequired || "—"}</p>
                        </div>

                        <div className="requirement-detail-description">
                            <h3>Job Description</h3>
                            <p>{requirement.jobDescription || "—"}</p>
                        </div>
                    </section>
                </div>
            </section>
        </section>
    );
};
export default ViewRequirementDetail;