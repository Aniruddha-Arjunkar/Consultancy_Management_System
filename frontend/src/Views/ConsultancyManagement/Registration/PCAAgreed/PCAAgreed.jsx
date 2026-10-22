import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import studentRegistrationService from "../../../../services/studentRegistrationService";
import agreementService from "../../../../services/agreementService";
import "./PCAAgreed.css";

const PCAAgreed = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [agreementDate, setAgreementDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let active = true;

        const loadStudent = async () => {
            try {
                const data =
                    await studentRegistrationService.getStudentById(studentId);
                if (active) setStudent(data);
            } catch (error) {
                if (active) {
                    window.alert(error.message || "Could not load student.");
                    navigate("/consultancy/viewStudents");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadStudent();

        return () => {
            active = false;
        };
    }, [studentId, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        try {
            await agreementService.convertStudent(studentId, {
                status: "Agreed",
                agreementDate,
            });

            window.alert("Agreement submitted. Student moved to All Candidates.");
            navigate("/consultancy/all-candidates");
        } catch (error) {
            window.alert(error.message || "Could not submit agreement.");
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

    if (!student) return null;

    return (
        <section id="main-content">
            <section className="wrapper pca-agreed-page">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">📄</span>
                                <div>
                                    <h2>Agreement</h2>
                                    <p>Submit student agreement details</p>
                                </div>
                            </div>
                        </div>

                        <form className="refollowup-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input value={student.name || ""} readOnly />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input value={student.phone || ""} readOnly />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input value={student.email || ""} readOnly />
                                </div>
                                <div className="form-group">
                                    <label>Experience</label>
                                    <input
                                        value={student.experience || ""}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Skills</label>
                                    <input value={student.skills || ""} readOnly />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="agreementDate">
                                        Agreement Date
                                    </label>
                                    <input
                                        id="agreementDate"
                                        type="date"
                                        value={agreementDate}
                                        onChange={(event) =>
                                            setAgreementDate(event.target.value)
                                        }
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
                                    ? "Submitting..."
                                    : "📄 Submit Agreement"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default PCAAgreed;