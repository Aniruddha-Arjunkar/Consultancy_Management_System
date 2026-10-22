import { useEffect, useRef, useState } from "react";
import studentRegistrationService from "../../../../services/studentRegistrationService";
import "./AddStudent.css";

const initialForm = {
    requirementId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    experience: "Fresher",
    experienceDescription: "",
    dob: "",
    gender: "Male",
    tenTh: "10th",
    tenThPercentage: "",
    tenThYearOfPassing: "",
    twelveTh: "12th",
    twelveThPercentage: "",
    twelveThYearOfPassing: "",
    graduation: "",
    graduationPercentage: "",
    graduationYearOfPassing: "",
    postGraduation: "",
    postGraduationPercentage: "",
    postGraduationYearOfPassing: "",
    skills: "",
};

const AddStudent = () => {
    const [form, setForm] = useState(initialForm);
    const [requirements, setRequirements] = useState([]);
    const [resume, setResume] = useState(null);
    const [loadingRequirements, setLoadingRequirements] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const resumeInputRef = useRef(null);

    useEffect(() => {
        let active = true;

        const loadRequirements = async () => {
            try {
                const data =
                    await studentRegistrationService.getCurrentRequirements();

                if (active) {
                    setRequirements(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (active) {
                    window.alert(
                        error.message || "Could not load current requirements ❌."
                    );
                }
            } finally {
                if (active) setLoadingRequirements(false);
            }
        };

        loadRequirements();

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!resume) {
            window.alert("Please upload the student's resume.");
            return;
        }

        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });

        formData.append("resume", resume);

        setSubmitting(true);

        try {
            await studentRegistrationService.createStudentRegistration(formData);
            window.alert("Student registered successfully ✅.");

            setForm({ ...initialForm });
            setResume(null);

            if (resumeInputRef.current) {
                resumeInputRef.current.value = "";
            }
        } catch (error) {
            window.alert(error.message || "Could not register student ❌.");
        } finally {
            setSubmitting(false);
        }
    };

    const field = (label, name, options = {}) => (
        <div className={`form-group ${options.fullWidth ? "full-width" : ""}`}>
            <label htmlFor={name}>
                {label}
                {options.required && <span className="required"> *</span>}
            </label>
            <input
                id={name}
                name={name}
                type={options.type || "text"}
                value={form[name]}
                onChange={handleChange}
                placeholder={options.placeholder || label}
                required={options.required || false}
                min={options.min}
                max={options.max}
                step={options.step}
            />
        </div>
    );

    return (
        <section id="main-content">
            <section className="add-student-page">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">🎓</span>
                                <div>
                                    <h2>Add Student</h2>
                                    <p>Register a student for a current job profile</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="requirementId">
                                        Current Requirement
                                        <span className="required"> *</span>
                                    </label>
                                    <select
                                        id="requirementId"
                                        name="requirementId"
                                        value={form.requirementId}
                                        onChange={handleChange}
                                        required
                                        disabled={
                                            loadingRequirements ||
                                            requirements.length === 0
                                        }
                                    >
                                        <option value="">
                                            {loadingRequirements
                                                ? "Loading requirements..."
                                                : "Select a current job profile"}
                                        </option>
                                        {requirements.map((requirement) => (
                                            <option
                                                key={requirement.id}
                                                value={requirement.id}
                                            >
                                                {requirement.companyName} —{" "}
                                                {requirement.jobProfile}
                                                {requirement.location
                                                    ? ` (${requirement.location})`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                    {!loadingRequirements &&
                                        requirements.length === 0 && (
                                            <small>
                                                No current requirements are
                                                available.
                                            </small>
                                        )}
                                </div>
                            </div>

                            <div className="form-row">
                                {field("Name", "name", {
                                    required: true,
                                })}
                                {field("Email", "email", {
                                    type: "email",
                                    required: true,
                                })}
                            </div>

                            <div className="form-row">
                                {field("Phone", "phone", {
                                    type: "tel",
                                    required: true,
                                })}
                                {field("City", "address")}
                            </div>

                            <div className="form-row">

                                <div className="form-group">
                                    <label htmlFor="experience">
                                        Fresher/Experience
                                        <span className="required"> *</span>
                                    </label>
                                    <select
                                        id="experience"
                                        name="experience"
                                        value={form.experience}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Fresher">Fresher</option>
                                        <option value="Experience">Experience</option>
                                    </select>
                                </div>


                                {field("Date of Birth", "dob", {
                                    type: "date",
                                    required: true,
                                })}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="gender">
                                        Gender <span className="required">*</span>
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="experienceDescription">
                                        Experience Description
                                    </label>
                                    <textarea
                                        id="experienceDescription"
                                        name="experienceDescription"
                                        rows="3"
                                        value={form.experienceDescription}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <h3 className="student-section-title">
                                Educational Qualifications
                            </h3>

                            <div className="student-qualification-wrapper">
                                <table className="qualification-table">
                                    <thead>
                                        <tr>
                                            <th>Qualification</th>
                                            <th>Percentage</th>
                                            <th>Year of Passing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>10th</td>
                                            <td>
                                                <input
                                                    name="tenThPercentage"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={form.tenThPercentage}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    name="tenThYearOfPassing"
                                                    value={form.tenThYearOfPassing}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>12th</td>
                                            <td>
                                                <input
                                                    name="twelveThPercentage"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={form.twelveThPercentage}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    name="twelveThYearOfPassing"
                                                    value={form.twelveThYearOfPassing}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input
                                                    aria-label="Graduation qualification"
                                                    name="graduation"
                                                    placeholder="Graduation"
                                                    value={form.graduation}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    name="graduationPercentage"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={form.graduationPercentage}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    name="graduationYearOfPassing"
                                                    value={form.graduationYearOfPassing}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input
                                                    aria-label="Post graduation qualification"
                                                    name="postGraduation"
                                                    placeholder="Post Graduation"
                                                    value={form.postGraduation}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    name="postGraduationPercentage"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={form.postGraduationPercentage}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    name="postGraduationYearOfPassing"
                                                    value={form.postGraduationYearOfPassing}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="form-row">
                                {field("Skills", "skills", {
                                    fullWidth: true,
                                    placeholder: "Enter skills",
                                })}
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="resume">
                                        Upload Resume
                                        <span className="required"> *</span>
                                    </label>
                                    <input
                                        ref={resumeInputRef}
                                        id="resume"
                                        name="resume"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(event) =>
                                            setResume(
                                                event.target.files?.[0] || null
                                            )
                                        }
                                        required
                                    />
                                    <small>PDF, DOC, or DOCX; maximum 10 MB.</small>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="student-submit-btn"
                                disabled={
                                    submitting ||
                                    loadingRequirements ||
                                    requirements.length === 0
                                }
                            >
                                {submitting ? "Registering..." : "🎓 Add Student"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default AddStudent;