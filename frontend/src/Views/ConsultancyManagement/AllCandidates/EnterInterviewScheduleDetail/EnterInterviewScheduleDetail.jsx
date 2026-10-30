import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import agreementService from "../../../../services/agreementService";
import interviewScheduleService from "../../../../services/interviewScheduleService";
import "./EnterInterviewScheduleDetail.css";

const EnterInterviewScheduleDetail = () => {
    const { candidateId } = useParams();
    const navigate = useNavigate();

    const [candidate, setCandidate] = useState(null);
    const [requirements, setRequirements] = useState([]);
    const [companyName, setCompanyName] = useState("");
    const [requirementId, setRequirementId] = useState("");
    const [interviewDate, setInterviewDate] = useState("");
    const [interviewTime, setInterviewTime] = useState("");
    const [interviewRound, setInterviewRound] = useState("1");
    const [hrName, setHrName] = useState("");
    const [remark, setRemark] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadFormData = async () => {
            try {
                const [candidateData, requirementData] = await Promise.all([
                    agreementService.getCandidate(candidateId),
                    interviewScheduleService.getCurrentRequirements(),
                ]);

                if (!active) return;

                setCandidate(candidateData);
                setRequirements(
                    Array.isArray(requirementData) ? requirementData : []
                );
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message ||
                            "Could not load interview schedule details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadFormData();

        return () => {
            active = false;
        };
    }, [candidateId]);

    const companies = useMemo(
        () =>
            [...new Set(requirements.map((item) => item.companyName))]
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b)),
        [requirements]
    );

    const companyRequirements = useMemo(
        () =>
            requirements.filter(
                (item) => item.companyName === companyName
            ),
        [requirements, companyName]
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            await interviewScheduleService.scheduleInterview({
                candidateId: Number(candidateId),
                requirementId: Number(requirementId),
                interviewDate,
                interviewTime,
                interviewRound: Number(interviewRound),
                hrName,
                remark,
            });

            window.alert("Interview scheduled successfully.");
            navigate("/consultancy/interview-schedule");
        } catch (submitError) {
            setError(
                submitError.message || "Could not schedule the interview."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading interview form...</p>
                </section>
            </section>
        );
    }

    if (error && !candidate) {
        return (
            <section id="main-content">
                <section className="">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/consultancy/view-candidate-detail/${candidateId}`
                            )
                        }
                    >
                        Back to Candidate Details
                    </button>
                </section>
            </section>
        );
    }

    return (
        <section id="main-content">
            <section className="">
                <div className="reg-w3 enter-interview-schedule-page">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">📅</span>
                                <div>
                                    <h2>Schedule Interview</h2>
                                    <p>Schedule interview for candidate</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            {error && (
                                <p className="interview-form-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="candidateName">
                                        Candidate Name
                                    </label>
                                    <input
                                        id="candidateName"
                                        value={candidate?.name || ""}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="interviewDate">
                                        Interview Date
                                    </label>
                                    <input
                                        id="interviewDate"
                                        type="date"
                                        value={interviewDate}
                                        onChange={(event) =>
                                            setInterviewDate(event.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="interviewTime">
                                        Interview Time
                                    </label>
                                    <input
                                        id="interviewTime"
                                        type="time"
                                        value={interviewTime}
                                        onChange={(event) =>
                                            setInterviewTime(event.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="companyName">
                                        Company Name
                                    </label>
                                    <select
                                        id="companyName"
                                        value={companyName}
                                        onChange={(event) => {
                                            setCompanyName(event.target.value);
                                            setRequirementId("");
                                        }}
                                        required
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="position">
                                        Position
                                    </label>
                                    <select
                                        id="position"
                                        value={requirementId}
                                        onChange={(event) =>
                                            setRequirementId(event.target.value)
                                        }
                                        required
                                        disabled={!companyName}
                                    >
                                        <option value="">Select Position</option>
                                        {companyRequirements.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.jobProfile}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="interviewRound">
                                        Interview Round
                                    </label>
                                    <select
                                        id="interviewRound"
                                        value={interviewRound}
                                        onChange={(event) =>
                                            setInterviewRound(event.target.value)
                                        }
                                        required
                                    >
                                        {[1, 2, 3, 4].map((round) => (
                                            <option key={round} value={round}>
                                                Round {round}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="hrName">Managed By</label>
                                    <input
                                        id="hrName"
                                        value={hrName}
                                        onChange={(event) =>
                                            setHrName(event.target.value)
                                        }
                                        placeholder="HR Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="remark">Remark</label>
                                    <input
                                        id="remark"
                                        value={remark}
                                        onChange={(event) =>
                                            setRemark(event.target.value)
                                        }
                                        placeholder="Add any remark or note here"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={submitting}
                            >
                                <span>📅</span>
                                {submitting
                                    ? "Scheduling..."
                                    : "Schedule Interview"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};

export default EnterInterviewScheduleDetail;