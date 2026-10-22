import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import studentRegistrationService from "../../../../services/studentRegistrationService";
import agreementService from "../../../../services/agreementService";
import "./ViewStudentDetail.css";

const escapeText = (value) =>
    value === null || value === undefined || value === "" ? "—" : value;

const ViewStudentDetail = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    const handlePcaNotAgreed = async () => {
        const confirmed = window.confirm(
            "Mark this student as PCA Not Agreed and move them to All Candidates?"
        );

        if (!confirmed) return;

        try {
            await agreementService.convertStudent(student.id, {
                status: "Not Agreed",
                agreementDate: null,
            });

            window.alert("Student moved to All Candidates as PCA Not Agreed.");
            navigate("/consultancy/all-candidates");
        } catch (error) {
            window.alert(error.message || "Could not update candidate status.");
        }
    };

    useEffect(() => {
        let active = true;

        const loadStudent = async () => {
            try {
                const data =
                    await studentRegistrationService.getStudentById(studentId);

                if (active) setStudent(data);
            } catch (error) {
                if (active) {
                    window.alert(error.message || "Could not load student details.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadStudent();

        return () => {
            active = false;
        };
    }, [studentId]);

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading student details...</p>
                </section>
            </section>
        );
    }

    if (!student) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Student record not found.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/consultancy/viewStudents")}
                    >
                        ← Back to Students
                    </button>
                </section>
            </section>
        );
    }

    return (
        <section id="main-content">
            <section className="">
                <div className="view-clients-page student-detail-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">👤</span>
                                Candidate Details
                            </h1>
                            <p className="view-clients-subtitle">
                                View candidate personal, education and experience details
                            </p>
                        </div>

                        <span className="view-clients-count">
                            Candidate ID: {student.id}
                        </span>
                    </div>

                    <div className="view-clients-card student-detail-card">
                        <section className="view-client-section">
                            <div className="view-client-section-header">
                                <h3>👤 Personal Details</h3>
                            </div>
                            <div className="view-clients-table-wrapper student-detail-table-wrapper">
                                <table className="view-clients-table student-detail-table student-personal-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Mobile No.</th>
                                            <th>Email</th>
                                            <th>Date of Birth</th>
                                            <th>Address</th>
                                            <th>Gender</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="view-client-name" style={{ fontWeight: '700' }}>{escapeText(student.name)}</td>
                                            <td className="view-client-phone">{escapeText(student.phone)}</td>
                                            <td>{escapeText(student.email)}</td>
                                            <td className="view-client-date-cell">{escapeText(student.dob)}</td>
                                            <td>{escapeText(student.address)}</td>
                                            <td>{escapeText(student.gender)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="view-client-section">
                            <div className="view-client-section-header">
                                <h3>🎓 Education Details</h3>
                            </div>
                            <div className="view-clients-table-wrapper student-detail-table-wrapper">
                                <table className="view-clients-table student-detail-table student-education-table">
                                    <thead>
                                        <tr>
                                            <th>Qualification</th>
                                            <th>Year of Passing</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="view-client-service">10th</td>
                                            <td>{escapeText(student.tenThYearOfPassing)}</td>
                                            <td>{escapeText(student.tenThPercentage)}</td>
                                        </tr>
                                        <tr>
                                            <td className="view-client-service">12th</td>
                                            <td>{escapeText(student.twelveThYearOfPassing)}</td>
                                            <td>{escapeText(student.twelveThPercentage)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="view-client-section">
                            <div className="view-client-section-header">
                                <h3>🎓 Graduation Details</h3>
                            </div>
                            <div className="view-clients-table-wrapper student-detail-table-wrapper">
                                <table className="view-clients-table student-detail-table student-education-table">
                                    <thead>
                                        <tr>
                                            <th>Qualification</th>
                                            <th>Year of Passing</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="view-client-service">{escapeText(student.graduation)}</td>
                                            <td>{escapeText(student.graduationYearOfPassing)}</td>
                                            <td>{escapeText(student.graduationPercentage)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="view-client-section">
                            <div className="view-client-section-header">
                                <h3>🎓 Post Graduation Details</h3>
                            </div>
                            <div className="view-clients-table-wrapper student-detail-table-wrapper">
                                <table className="view-clients-table student-detail-table student-education-table">
                                    <thead>
                                        <tr>
                                            <th>Qualification</th>
                                            <th>Year of Passing</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="view-client-service">{escapeText(student.postGraduation)}</td>
                                            <td>{escapeText(student.postGraduationYearOfPassing)}</td>
                                            <td>{escapeText(student.postGraduationPercentage)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="view-client-section">
                            <div className="view-client-section-header">
                                <h3>💼 Experience / Skills</h3>
                            </div>
                            <div className="view-clients-table-wrapper student-detail-table-wrapper">
                                <table className="view-clients-table student-detail-table student-experience-table">
                                    <thead>
                                        <tr>
                                            <th>Experience</th>
                                            <th>Experience Description</th>
                                            <th>Skills</th>
                                            <th>Resume</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{escapeText(student.experience)}</td>
                                            <td>{escapeText(student.experienceDescription)}</td>
                                            <td>{escapeText(student.skills)}</td>
                                            <td>
                                                {student.resume ? (
                                                    <a
                                                        href={`/api/students/${student.id}/resume`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="view-client-update-btn"
                                                    >
                                                        View Resume
                                                    </a>
                                                ) : (
                                                    <span className="view-client-no-data">No Resume</span>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <div className="candidate-actions">
                            <button
                                type="button"
                                className="btn btn-pca-agreed"
                                onClick={() =>
                                    navigate(`/consultancy/pca-agreed/${student.id}`)
                                }
                            >
                                PCA Agreed
                            </button>

                            <button
                                type="button"
                                className="btn btn-pca-not-agreed"
                                onClick={handlePcaNotAgreed}
                            >
                                PCA Not Agreed
                            </button>
                            <button type="button" className="btn btn-update"
                                onClick={() => {
                                    navigate(`/consultancy/update-student/${student.id}`)
                                }}>
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};

export default ViewStudentDetail;
