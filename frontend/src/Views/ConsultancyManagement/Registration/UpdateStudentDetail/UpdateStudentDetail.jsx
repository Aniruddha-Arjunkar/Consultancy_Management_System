import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import studentRegistrationService from "../../../../services/studentRegistrationService";
import "./UpdateStudentDetail.css";

const emptyForm = {
    name: "",
    phone: "",
    email: "",
    dob: "",
    address: "",
    gender: "",
    tenThYearOfPassing: "",
    tenThPercentage: "",
    twelveThYearOfPassing: "",
    twelveThPercentage: "",
    graduation: "",
    graduationYearOfPassing: "",
    graduationPercentage: "",
    postGraduation: "",
    postGraduationYearOfPassing: "",
    postGraduationPercentage: "",
    experience: "",
    experienceDescription: "",
    skills: "",
};

const optionalNumber = (value) =>
    value.trim() === "" ? null : Number(value);

const UpdateStudentDetail = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let active = true;

        const loadStudent = async () => {
            try {
                const student =
                    await studentRegistrationService.getStudentById(studentId);

                if (!active) return;

                setForm({
                    name: student.name ?? "",
                    phone: student.phone ?? "",
                    email: student.email ?? "",
                    dob: student.dob ?? "",
                    address: student.address ?? "",
                    gender: student.gender ?? "",
                    tenThYearOfPassing: student.tenThYearOfPassing ?? "",
                    tenThPercentage:
                        student.tenThPercentage == null
                            ? ""
                            : String(student.tenThPercentage),
                    twelveThYearOfPassing:
                        student.twelveThYearOfPassing ?? "",
                    twelveThPercentage:
                        student.twelveThPercentage == null
                            ? ""
                            : String(student.twelveThPercentage),
                    graduation: student.graduation ?? "",
                    graduationYearOfPassing:
                        student.graduationYearOfPassing ?? "",
                    graduationPercentage:
                        student.graduationPercentage == null
                            ? ""
                            : String(student.graduationPercentage),
                    postGraduation: student.postGraduation ?? "",
                    postGraduationYearOfPassing:
                        student.postGraduationYearOfPassing ?? "",
                    postGraduationPercentage:
                        student.postGraduationPercentage == null
                            ? ""
                            : String(student.postGraduationPercentage),
                    experience: student.experience ?? "",
                    experienceDescription:
                        student.experienceDescription ?? "",
                    skills: student.skills ?? "",
                });
            } catch (error) {
                if (active) {
                    const message =
                        error.message || "Could not load student details.";
                    setLoadError(message);
                    window.alert(message);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        if (!studentId) {
            setLoadError("Student ID is missing.");
            setLoading(false);
        } else {
            loadStudent();
        }

        return () => {
            active = false;
        };
    }, [studentId]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        const payload = {
            ...form,
            tenThPercentage: optionalNumber(form.tenThPercentage),
            twelveThPercentage: optionalNumber(form.twelveThPercentage),
            graduationPercentage: optionalNumber(form.graduationPercentage),
            postGraduationPercentage: optionalNumber(
                form.postGraduationPercentage
            ),
        };

        try {
            await studentRegistrationService.updateStudent(studentId, payload);
            window.alert("Student details updated successfully ✅.");
            navigate(`/consultancy/view-student-detail/${studentId}`);
        } catch (error) {
            window.alert(error.message || "Could not update student details ❌.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading student details...</p>
                </section>
            </section>
        );
    }

    if (loadError && !form.name) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>{loadError}</p>
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/consultancy/view-student-detail/${studentId}`
                            )
                        }
                    >
                        Back to Student Details
                    </button>
                </section>
            </section>
        );
    }

    const field = (label, name, type = "text", required = false) => (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required={required}
            />
        </div>
    );

    return (
        <section id="main-content">
            <section className=" update-student-detail-page">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">✏️</span>
                                <div>
                                    <h2>Update Student Details</h2>
                                    <p>Update student registration details</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="refollowup-header">
                                <div className="refollowup-title">
                                    <span className="phone-icon">👤</span>
                                    <div>
                                        <h2>Personal Details</h2>
                                        <p>Personal information</p>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                {field("Name", "name", "text", true)}
                                {field("Mobile No.", "phone", "text", true)}
                            </div>

                            <div className="form-row">
                                {field("Email", "email", "email", true)}
                                {field("Date of Birth", "dob", "date", true)}
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="address">Address</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="gender">Gender</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="refollowup-header">
                                <div className="refollowup-title">
                                    <span className="phone-icon">🎓</span>
                                    <div>
                                        <h2>Education Details</h2>
                                        <p>Academic qualification details</p>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                {field("10th Year of Passing", "tenThYearOfPassing")}
                                {field("10th Percentage", "tenThPercentage", "number")}
                            </div>

                            <div className="form-row">
                                {field(
                                    "12th Year of Passing",
                                    "twelveThYearOfPassing"
                                )}
                                {field(
                                    "12th Percentage",
                                    "twelveThPercentage",
                                    "number"
                                )}
                            </div>

                            <div className="refollowup-header">
                                <div className="refollowup-title">
                                    <span className="phone-icon">📚</span>
                                    <div>
                                        <h2>Graduation Details</h2>
                                        <p>Graduation qualification details</p>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                {field("Graduation", "graduation")}
                                {field(
                                    "Graduation Year of Passing",
                                    "graduationYearOfPassing"
                                )}
                            </div>

                            <div className="form-row">
                                {field(
                                    "Graduation Percentage",
                                    "graduationPercentage",
                                    "number"
                                )}
                            </div>

                            <div className="refollowup-header">
                                <div className="refollowup-title">
                                    <span className="phone-icon">🎓</span>
                                    <div>
                                        <h2>Post-Graduation Details</h2>
                                        <p>Post-graduation qualification details</p>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                {field("Post-Graduation", "postGraduation")}
                                {field(
                                    "Post-Graduation Year of Passing",
                                    "postGraduationYearOfPassing"
                                )}
                            </div>

                            <div className="form-row">
                                {field(
                                    "Post-Graduation Percentage",
                                    "postGraduationPercentage",
                                    "number"
                                )}
                            </div>

                            <div className="refollowup-header">
                                <div className="refollowup-title">
                                    <span className="phone-icon">💼</span>
                                    <div>
                                        <h2>Experience Details</h2>
                                        <p>Professional experience and skills</p>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                {field("Experience", "experience", "text", true)}
                                {field("Skills", "skills")}
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="experienceDescription">
                                        Experience Description
                                    </label>
                                    <textarea
                                        id="experienceDescription"
                                        name="experienceDescription"
                                        value={form.experienceDescription}
                                        onChange={handleChange}
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="update-student-actions">
                                

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Updating..."
                                        : "✏️ Update All Details"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default UpdateStudentDetail;