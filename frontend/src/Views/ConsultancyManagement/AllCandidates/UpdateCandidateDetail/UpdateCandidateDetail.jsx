import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import agreementService from "../../../../services/agreementService";
import "./UpdateCandidateDetail.css";

const emptyForm = {
    name: "",
    email: "",
    phone: "",
    dob: "",
    agreementDate: "",
    gender: "",
    tenTh: "",
    tenThPercentage: "",
    tenThYearOfPassing: "",
    twelveTh: "",
    twelveThPercentage: "",
    twelveThYearOfPassing: "",
    graduation: "",
    graduationPercentage: "",
    graduationYearOfPassing: "",
    postGraduation: "",
    postGraduationPercentage: "",
    postGraduationYearOfPassing: "",
    address: "",
    shippingAddress: "",
    gstNumber: "",
    experience: "",
    experienceDescription: "",
    skills: "",
    status: "Not Agreed",
};

const optionalNumber = (value) =>
    value === "" ? null : Number(value);

const UpdateCandidateDetail = () => {
    const { candidateId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let active = true;

        const loadCandidate = async () => {
            try {
                const candidate =
                    await agreementService.getCandidate(candidateId);

                if (!active) return;

                setForm({
                    ...emptyForm,
                    ...candidate,
                    dob: candidate.dob ?? "",
                    agreementDate: candidate.agreementDate ?? "",
                    tenThPercentage:
                        candidate.tenThPercentage == null
                            ? ""
                            : String(candidate.tenThPercentage),
                    twelveThPercentage:
                        candidate.twelveThPercentage == null
                            ? ""
                            : String(candidate.twelveThPercentage),
                    graduationPercentage:
                        candidate.graduationPercentage == null
                            ? ""
                            : String(candidate.graduationPercentage),
                    postGraduationPercentage:
                        candidate.postGraduationPercentage == null
                            ? ""
                            : String(candidate.postGraduationPercentage),
                });
            } catch (error) {
                if (active) {
                    setLoadError(
                        error.message || "Could not load candidate details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        if (!candidateId) {
            setLoadError("Candidate ID is missing.");
            setLoading(false);
        } else {
            loadCandidate();
        }

        return () => {
            active = false;
        };
    }, [candidateId]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        const payload = {
            ...form,
            dob: form.dob || null,
            agreementDate: form.agreementDate || null,
            tenThPercentage: optionalNumber(form.tenThPercentage),
            twelveThPercentage: optionalNumber(form.twelveThPercentage),
            graduationPercentage: optionalNumber(form.graduationPercentage),
            postGraduationPercentage: optionalNumber(
                form.postGraduationPercentage
            ),
        };

        try {
            await agreementService.updateCandidate(candidateId, payload);
            window.alert("Candidate details updated successfully.");
            navigate(`/consultancy/view-candidate-detail/${candidateId}`);
        } catch (error) {
            window.alert(
                error.message || "Could not update candidate details."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const field = (label, name, type = "text", required = false) => (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                value={form[name] ?? ""}
                onChange={handleChange}
                required={required}
                min={type === "number" ? "0" : undefined}
                max={type === "number" ? "100" : undefined}
                step={type === "number" ? "0.01" : undefined}
            />
        </div>
    );

    const textArea = (label, name, rows = 3) => (
        <div className="form-group full-width">
            <label htmlFor={name}>{label}</label>
            <textarea
                id={name}
                name={name}
                rows={rows}
                value={form[name] ?? ""}
                onChange={handleChange}
            />
        </div>
    );

    const sectionHeader = (icon, title, subtitle) => (
        <div className="refollowup-header candidate-update-section-header">
            <div className="refollowup-title">
                <span className="phone-icon">{icon}</span>
                <div>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading candidate details...</p>
                </section>
            </section>
        );
    }

    if (loadError) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="reg-w3 update-candidate-detail-page">
                        <div className="refollowup-card">
                            <p className="candidate-update-error">
                                {loadError}
                            </p>
                            <button
                                type="button"
                                className="submit-btn"
                                onClick={() =>
                                    navigate(
                                        `/consultancy/view-candidate-detail/${candidateId}`
                                    )
                                }
                            >
                                Back to Candidate Details
                            </button>
                        </div>
                    </div>
                </section>
            </section>
        );
    }

    return (
        <section id="main-content">
            <section className="">
                <div className="reg-w3 update-candidate-detail-page">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">✏️</span>
                                <div>
                                    <h2>Edit Student Agreement</h2>
                                    <p>Update student agreement details</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            {sectionHeader(
                                "👤",
                                "Personal Information",
                                "Candidate personal and agreement details"
                            )}

                            <div className="form-row">
                                {field("Name", "name", "text", true)}
                                {field("Email", "email", "email", true)}
                            </div>

                            <div className="form-row">
                                {field("Phone", "phone", "tel", true)}
                                {field("Date of Birth", "dob", "date")}
                            </div>

                            <div className="form-row">
                                {field("Agreement Date", "agreementDate", "date")}

                                <div className="form-group">
                                    <label htmlFor="gender">Gender</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {sectionHeader(
                                "🎓",
                                "10th Details",
                                "Secondary education details"
                            )}

                            <div className="form-row">
                                {field("Board", "tenTh")}
                                {field("Percentage", "tenThPercentage", "number")}
                            </div>

                            <div className="form-row">
                                {field("Year of Passing", "tenThYearOfPassing")}
                            </div>

                            {sectionHeader(
                                "🎓",
                                "12th Details",
                                "Higher secondary education details"
                            )}

                            <div className="form-row">
                                {field("Board", "twelveTh")}
                                {field(
                                    "Percentage",
                                    "twelveThPercentage",
                                    "number"
                                )}
                            </div>

                            <div className="form-row">
                                {field(
                                    "Year of Passing",
                                    "twelveThYearOfPassing"
                                )}
                            </div>

                            {sectionHeader(
                                "📚",
                                "Graduation",
                                "Graduation qualification details"
                            )}

                            <div className="form-row">
                                {field("Degree", "graduation")}
                                {field(
                                    "Percentage",
                                    "graduationPercentage",
                                    "number"
                                )}
                            </div>

                            <div className="form-row">
                                {field(
                                    "Year of Passing",
                                    "graduationYearOfPassing"
                                )}
                            </div>

                            {sectionHeader(
                                "🎓",
                                "Post Graduation",
                                "Post-graduation qualification details"
                            )}

                            <div className="form-row">
                                {field("Degree", "postGraduation")}
                                {field(
                                    "Percentage",
                                    "postGraduationPercentage",
                                    "number"
                                )}
                            </div>

                            <div className="form-row">
                                {field(
                                    "Year of Passing",
                                    "postGraduationYearOfPassing"
                                )}
                            </div>

                            {sectionHeader(
                                "💼",
                                "Experience & Skills",
                                "Professional experience and skills"
                            )}

                            <div className="form-row">
                                {field("Experience", "experience", "text", true)}
                                {textArea(
                                    "Experience Description",
                                    "experienceDescription",
                                    3
                                )}
                            </div>

                            <div className="form-row">
                                {textArea("Skills", "skills", 3)}
                            </div>

                            {sectionHeader(
                                "📍",
                                "Address & Other Details",
                                "Address, tax and agreement status"
                            )}

                            <div className="form-row">
                                {textArea("Address", "address", 2)}
                                <div className="form-group">
                                    <label htmlFor="shippingAddress">
                                        Shipping Address
                                    </label>
                                    <input
                                        id="shippingAddress"
                                        name="shippingAddress"
                                        type="text"
                                        value={form.shippingAddress ?? ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                {field("GST Number", "gstNumber")}

                                <div className="form-group">
                                    <label htmlFor="status">
                                        Agreement Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Agreed">Agreed</option>
                                        <option value="Not Agreed">
                                            Not Agreed
                                        </option>
                                        <option value="Blacklisted">
                                            Blacklisted
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="update-candidate-actions">
                                <button
                                    type="button"
                                    className="candidate-cancel-btn"
                                    onClick={() =>
                                        navigate(
                                            `/consultancy/view-candidate-detail/${candidateId}`
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Updating..."
                                        : "✏️ Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};

export default UpdateCandidateDetail;