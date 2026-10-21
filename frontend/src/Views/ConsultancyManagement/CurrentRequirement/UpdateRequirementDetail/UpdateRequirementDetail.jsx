import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import currentRequirementService from "../../../../services/currentRequirementService";
import "./UpdateRequirementDetail.css";

const UpdateCurrentRequirement = () => {
    const { requirementId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [associateCompanies, setAssociateCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let active = true;

        const loadFormData = async () => {
            try {
                const [requirement, companies] = await Promise.all([
                    currentRequirementService.getCurrentRequirementById(
                        requirementId
                    ),
                    currentRequirementService.getAssociateCompanyOptions(),
                ]);

                if (!active) return;

                setAssociateCompanies(companies);
                setForm({
                    associateCompanyId: String(
                        requirement.associateCompanyId ?? ""
                    ),
                    location: requirement.location ?? "",
                    education: requirement.education ?? "",
                    jobProfile: requirement.jobProfile ?? "",
                    noOfPositions: String(requirement.noOfPositions ?? 1),
                    positionLevel: requirement.positionLevel ?? "",
                    yearsOfExperience:
                        requirement.yearsOfExperience ?? "",
                    jobDescription: requirement.jobDescription ?? "",
                    skillsRequired: requirement.skillsRequired ?? "",
                    openDate: requirement.openDate ?? "",
                    closeDate: requirement.closeDate ?? "",
                    selectCandidate: String(
                        requirement.selectCandidate ?? 0
                    ),
                });
            } catch (error) {
                if (active) {
                    const message =
                        error.message || "Could not load requirement details.";
                    setLoadError(message);
                    window.alert(message);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        if (!requirementId) {
            setLoadError("Requirement ID is missing.");
            window.alert("Requirement ID is missing.");
            setLoading(false);
        } else {
            loadFormData();
        }

        return () => {
            active = false;
        };
    }, [requirementId]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "associateCompanyId") {
            const company = associateCompanies.find(
                (item) => String(item.id) === value
            );

            setForm((current) => ({
                ...current,
                associateCompanyId: value,
                location: company?.location || current.location,
            }));
            return;
        }

        setForm((current) => {
            const updated = { ...current, [name]: value };

            if (name === "positionLevel" && value === "Fresher") {
                updated.yearsOfExperience = "";
            }

            return updated;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        const payload = {
            ...form,
            associateCompanyId: Number(form.associateCompanyId),
            noOfPositions: Number(form.noOfPositions),
            selectCandidate: Number(form.selectCandidate),
            yearsOfExperience:
                form.positionLevel === "Experienced" &&
                form.yearsOfExperience.trim()
                    ? form.yearsOfExperience.trim()
                    : null,
            closeDate: form.closeDate || null,
        };

        try {
            await currentRequirementService.updateCurrentRequirement(
                requirementId,
                payload
            );

            window.alert("Requirement updated successfully ✅.");
            navigate(
                `/consultancy/view-requirement-detail/${requirementId}`
            );
        } catch (error) {
            window.alert(error.message || "Could not update requirement ❌.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading requirement details...</p>
                </section>
            </section>
        );
    }

    if (!form) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>{loadError || "Requirement could not be loaded."}</p>
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/consultancy/view-requirement")
                        }
                    >
                        Back to Requirements
                    </button>
                </section>
            </section>
        );
    }

    return (
        <section id="main-content">
            <section className="update-current-requirement-page">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">✏️</span>
                                <div>
                                    <h2>Update Requirement</h2>
                                    <p>Update job requirement details</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="associateCompanyId">
                                        Associate Company <span>*</span>
                                    </label>
                                    <select
                                        id="associateCompanyId"
                                        name="associateCompanyId"
                                        value={form.associateCompanyId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select associate company
                                        </option>
                                        {associateCompanies.map((company) => (
                                            <option
                                                key={company.id}
                                                value={company.id}
                                            >
                                                {company.companyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location">
                                        Location <span>*</span>
                                    </label>
                                    <input
                                        id="location"
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        placeholder="Location"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="positionLevel">
                                        Position Level <span>*</span>
                                    </label>
                                    <select
                                        id="positionLevel"
                                        name="positionLevel"
                                        value={form.positionLevel}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Position Level
                                        </option>
                                        <option value="Fresher">Fresher</option>
                                        <option value="Experienced">
                                            Experienced
                                        </option>
                                    </select>
                                </div>

                                {form.positionLevel === "Experienced" && (
                                    <div className="form-group">
                                        <label htmlFor="yearsOfExperience">
                                            Years of Experience
                                        </label>
                                        <input
                                            id="yearsOfExperience"
                                            name="yearsOfExperience"
                                            value={form.yearsOfExperience}
                                            onChange={handleChange}
                                            placeholder="Years of experience"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="noOfPositions">
                                        Number of Positions <span>*</span>
                                    </label>
                                    <input
                                        id="noOfPositions"
                                        name="noOfPositions"
                                        type="number"
                                        min="1"
                                        value={form.noOfPositions}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="jobProfile">
                                        Job Profile <span>*</span>
                                    </label>
                                    <input
                                        id="jobProfile"
                                        name="jobProfile"
                                        value={form.jobProfile}
                                        onChange={handleChange}
                                        placeholder="Job profile"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="jobDescription">
                                        Job Description <span>*</span>
                                    </label>
                                    <textarea
                                        id="jobDescription"
                                        name="jobDescription"
                                        rows="5"
                                        value={form.jobDescription}
                                        onChange={handleChange}
                                        placeholder="Job description"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="skillsRequired">
                                        Skills Required <span>*</span>
                                    </label>
                                    <input
                                        id="skillsRequired"
                                        name="skillsRequired"
                                        value={form.skillsRequired}
                                        onChange={handleChange}
                                        placeholder="Skills required"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="education">
                                        Education <span>*</span>
                                    </label>
                                    <input
                                        id="education"
                                        name="education"
                                        value={form.education}
                                        onChange={handleChange}
                                        placeholder="Education"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="openDate">
                                        Open Date <span>*</span>
                                    </label>
                                    <input
                                        id="openDate"
                                        name="openDate"
                                        type="date"
                                        value={form.openDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="closeDate">
                                        Close Date
                                    </label>
                                    <input
                                        id="closeDate"
                                        name="closeDate"
                                        type="date"
                                        value={form.closeDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="selectCandidate">
                                        Selected Candidates <span>*</span>
                                    </label>
                                    <input
                                        id="selectCandidate"
                                        name="selectCandidate"
                                        type="number"
                                        min="0"
                                        value={form.selectCandidate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Updating..."
                                    : "✏️ Update Requirement"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default UpdateCurrentRequirement;