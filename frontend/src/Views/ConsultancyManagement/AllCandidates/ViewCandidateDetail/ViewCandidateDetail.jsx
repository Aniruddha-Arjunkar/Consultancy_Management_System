import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import agreementService from "../../../../services/agreementService";
import "./ViewCandidateDetail.css";

const display = (value) =>
    value === null || value === undefined || value === "" ? "—" : value;

const formatPercent = (value) =>
    value === null || value === undefined || value === ""
        ? "—"
        : `${value}%`;

const ViewCandidateDetail = () => {
    const { candidateId } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [blacklisting, setBlacklisting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let active = true;

        const loadCandidate = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await agreementService.getCandidate(candidateId);
                if (active) setCandidate(data);
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load candidate details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadCandidate();

        return () => {
            active = false;
        };
    }, [candidateId]);

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading candidate details...</p>
                </section>
            </section>
        );
    }

    if (error || !candidate) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="view-clients-page candidate-detail-page">
                        <p>{error || "Candidate record not found."}</p>
                        <button
                            type="button"
                            className="candidate-detail-back-btn"
                            onClick={() =>
                                navigate("/consultancy/all-candidates")
                            }
                        >
                            ← Back to All Candidates
                        </button>
                    </div>
                </section>
            </section>
        );
    }

    const education = [
        {
            qualification: "10th",
            year: candidate.tenThYearOfPassing,
            percentage: candidate.tenThPercentage,
        },
        {
            qualification: "12th",
            year: candidate.twelveThYearOfPassing,
            percentage: candidate.twelveThPercentage,
        },
        {
            qualification: candidate.graduation,
            year: candidate.graduationYearOfPassing,
            percentage: candidate.graduationPercentage,
        },
        {
            qualification: candidate.postGraduation,
            year: candidate.postGraduationYearOfPassing,
            percentage: candidate.postGraduationPercentage,
        },
    ].filter(
        (row) =>
            row.qualification ||
            row.year ||
            row.percentage !== null && row.percentage !== undefined
    );

    const handleBlacklist = async () => {
        if (candidate.status === "Blacklisted" || blacklisting) return;

        const confirmed = window.confirm(
            `Are you sure you want to blacklist ${candidate.name}?`
        );

        if (!confirmed) return;

        setBlacklisting(true);

        try {
            const updatedCandidate =
                await agreementService.blacklistCandidate(candidate.id);

            setCandidate(updatedCandidate);
            window.alert("Candidate has been blacklisted.");
        } catch (blacklistError) {
            window.alert(
                blacklistError.message || "Could not blacklist this candidate."
            );
        } finally {
            setBlacklisting(false);
        }
    };


    const handleDeleteCandidate = async () => {
        if (deleting) return;

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this candidate?"
        );

        if (!confirmed) return;

        setDeleting(true);

        try {
            await agreementService.deleteCandidate(candidate.id);
            window.alert("Candidate deleted successfully.");
            navigate("/consultancy/all-candidates");
        } catch (deleteError) {
            window.alert(
                deleteError.message || "Could not delete this candidate."
            );
        } finally {
            setDeleting(false);
        }
    };
    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page candidate-detail-page">
                    <div className="candidate-detail-topbar">
                        <button
                            type="button"
                            className="candidate-detail-back-btn"
                            onClick={() =>
                                navigate("/consultancy/all-candidates")
                            }
                        >
                            ← Back to All Candidates
                        </button>

                        <div className="candidate-detail-actions">
                            <button
                                type="button"
                                className="candidate-detail-action candidate-detail-delete"
                                onClick={handleDeleteCandidate}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete Candidate"}
                            </button>

                            <button
                                type="button"
                                className="candidate-detail-action candidate-detail-update"
                                onClick={() =>
                                    navigate(`/consultancy/update-candidate/${candidate.id}`)
                                }
                            >
                                Edit &amp; Update Details
                            </button>

                            {candidate.status === "Blacklisted" ? (
                                <button
                                    type="button"
                                    className="candidate-detail-action candidate-detail-blacklist candidate-detail-already-blacklisted"
                                    disabled
                                >
                                    Already Blacklisted
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="candidate-detail-action candidate-detail-blacklist"
                                    onClick={handleBlacklist}
                                    disabled={blacklisting}
                                >
                                    {blacklisting ? "Blacklisting..." : "Blacklist Candidate"}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    👤
                                </span>
                                Candidate Details
                            </h1>
                            <p className="view-clients-subtitle">
                                Personal, education, experience, interview, and
                                payment information
                            </p>
                        </div>

                        <span className="view-clients-count">
                            Candidate ID: {candidate.id}
                        </span>
                    </div>

                    <div className="view-clients-card candidate-detail-card">
                        <section className="candidate-detail-section">
                            <h2>👤 Personal Details</h2>
                            <div className="candidate-detail-grid">
                                <div><strong>Name</strong><span>{display(candidate.name)}</span></div>
                                <div><strong>Mobile No.</strong><span>{display(candidate.phone)}</span></div>
                                <div><strong>Email</strong><span>{display(candidate.email)}</span></div>
                                <div><strong>Date of Birth</strong><span>{display(candidate.dob)}</span></div>
                                <div><strong>Gender</strong><span>{display(candidate.gender)}</span></div>
                                <div><strong>Address</strong><span>{display(candidate.address)}</span></div>
                                <div><strong>Job Profile</strong><span>{display(candidate.jobProfile)}</span></div>
                                <div><strong>Agreement Date</strong><span>{display(candidate.agreementDate)}</span></div>
                                <div><strong>Status</strong><span>{display(candidate.status)}</span></div>
                                <div><strong>Shipping Address</strong><span>{display(candidate.shippingAddress)}</span></div>
                                <div><strong>GST Number</strong><span>{display(candidate.gstNumber)}</span></div>
                            </div>
                        </section>

                        <section className="candidate-detail-section">
                            <h2>🎓 Education Details</h2>
                            {education.length > 0 ? (
                                <div className="view-clients-table-wrapper">
                                    <table className="view-clients-table candidate-detail-table">
                                        <thead>
                                            <tr>
                                                <th>Qualification</th>
                                                <th>Year of Passing</th>
                                                <th>Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {education.map((row, index) => (
                                                <tr key={`${row.qualification}-${index}`}>
                                                    <td>{display(row.qualification)}</td>
                                                    <td>{display(row.year)}</td>
                                                    <td>{formatPercent(row.percentage)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="candidate-detail-empty">
                                    No education details available.
                                </p>
                            )}
                        </section>

                        <section className="candidate-detail-section">
                            <h2>💼 Experience / Skills</h2>
                            <div className="candidate-detail-grid">
                                <div><strong>Experience</strong><span>{display(candidate.experience)}</span></div>
                                <div><strong>Experience Description</strong><span>{display(candidate.experienceDescription)}</span></div>
                                <div className="candidate-detail-wide"><strong>Skills</strong><span>{display(candidate.skills)}</span></div>
                                <div>
                                    <strong>Resume</strong>
                                    <span>{candidate.resume ? (
                                        <a
                                            href={agreementService.getCandidateResumeUrl(candidate.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="candidate-resume-link"
                                        >
                                            Open Resume
                                        </a>
                                    ) : (
                                        <span>No resume</span>
                                    )}</span>
                                </div>
                            </div>
                        </section>

                        <section className="candidate-detail-section">
                            <h2>📋 Interview and Placement Details</h2>
                            <p className="candidate-detail-empty">
                                No interview or placement details available for
                                this candidate.
                            </p>
                        </section>

                        <section className="candidate-detail-section">
                            <h2>💳 Payment Details</h2>
                            <p className="candidate-detail-empty">
                                No payment details available for this candidate.
                            </p>
                        </section>

                        {candidate.status !== "Blacklisted" && (
                            <div className="candidate-detail-schedule">
                                <button
                                    type="button"
                                    className="candidate-detail-schedule-btn"
                                >
                                    Schedule Interview
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </section>
    );
};

export default ViewCandidateDetail;