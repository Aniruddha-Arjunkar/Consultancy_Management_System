import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import currentRequirementService from "../../../../services/currentRequirementService";
import "./AddCurrentRequirement.css";

const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const initialForm = {
    associateCompanyId: "",
    location: "",
    education: "",
    jobProfile: "",
    noOfPositions: "1",
    positionLevel: "",
    yearsOfExperience: "",
    jobDescription: "",
    skillsRequired: "",
    openDate: getToday(),
};

const AddCurrentRequirement = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [associateCompanies, setAssociateCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let active = true;

        const loadAssociateCompanies = async () => {
            try {
                const companies =
                    await currentRequirementService.getAssociateCompanyOptions();

                if (active) {
                    setAssociateCompanies(companies);
                }
            } catch (error) {
                if (active) {
                    setLoadError(
                        error.message || "Could not load associate companies ❌."
                    );
                    window.alert(
                        error.message || "Could not load associate companies ❌."
                    );
                }
            } finally {
                if (active) setLoadingCompanies(false);
            }
        };

        loadAssociateCompanies();

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "associateCompanyId") {
            const selectedCompany = associateCompanies.find(
                (company) => String(company.id) === value
            );

            setForm((current) => ({
                ...current,
                associateCompanyId: value,
                location: selectedCompany?.location || "",
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
            yearsOfExperience:
                form.positionLevel === "Experienced" &&
                form.yearsOfExperience.trim()
                    ? form.yearsOfExperience.trim()
                    : null,
        };

        try {
            await currentRequirementService.createCurrentRequirement(payload);
            window.alert("Requirement added successfully ✅.");
            navigate("/consultancy/view-requirement");
        } catch (error) {
            window.alert(error.message || "Could not add requirement ❌.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="main-content">
            <section className="add-current-requirement-page">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">💼</span>
                                <div>
                                    <h2>Requirements</h2>
                                    <p>Add new job requirement details</p>
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
                                        disabled={
                                            loadingCompanies ||
                                            associateCompanies.length === 0
                                        }
                                    >
                                        <option value="">
                                            {loadingCompanies
                                                ? "Loading companies..."
                                                : "Select associate company"}
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
                                    {!loadingCompanies &&
                                        associateCompanies.length === 0 && (
                                            <small>
                                                No associate companies are
                                                available. Add an associate
                                                company first.
                                            </small>
                                        )}
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
                                        placeholder="Number of positions"
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
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={
                                    submitting ||
                                    loadingCompanies ||
                                    associateCompanies.length === 0
                                }
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "💼 Submit Requirement"}
                            </button>

                            {loadError && (
                                <p className="requirement-error">
                                    {loadError}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default AddCurrentRequirement;