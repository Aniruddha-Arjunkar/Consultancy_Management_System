import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import interviewScheduleService from "../../../../services/interviewScheduleService";
import "./UpdateInterviewSchedule.css";

const UpdateInterviewSchedule = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [current, setCurrent] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [interviewDate, setInterviewDate] = useState("");
    const [interviewTime, setInterviewTime] = useState("");
    const [hrName, setHrName] = useState("");
    const [remark, setRemark] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [scheduleMenuOpen, setScheduleMenuOpen] = useState(false);
    const [roundsModalOpen, setRoundsModalOpen] = useState(false);
    const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);

    useEffect(() => {
        let active = true;

        const loadInterview = async () => {
            try {
                const data =
                    await interviewScheduleService.getInterviewForUpdate(
                        interviewId
                    );

                if (!active) return;

                setCurrent(data.current);
                setRounds(data.rounds || []);

                if (data.current.interviewStatus !== "Completed") {
                    setInterviewDate(data.current.interviewDate || "");
                    setInterviewTime(data.current.interviewTime || "");
                    setHrName(data.current.hrName || "");
                    setRemark(data.current.remark || "");
                }
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load interview details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadInterview();

        return () => {
            active = false;
        };
    }, [interviewId]);

    const currentRound = Number(current?.interviewRound || 1);
    const nextRound = currentRound + 1;
    const isCompleted = current?.interviewStatus === "Completed";
    const isFinal =
        current?.interviewStatus === "Placed" ||
        current?.interviewStatus === "Rejected";

    const interviewStatusLabel =
        current?.interviewStatus === "Scheduled" ||
        current?.interviewStatus === "Rescheduled"
            ? "In Process"
            : isCompleted
              ? "Ready for Next Round"
              : current?.interviewStatus;

    const requestPayload = () => ({
        interviewDate,
        interviewTime,
        hrName: hrName.trim(),
        remark: remark.trim(),
    });

    const handleAction = async (action) => {
        if (saving) return;

        const messages = {
            reschedule: "Are you sure you want to Reschedule this interview?",
            complete: "Are you sure you want to mark this interview as Completed?",
            schedule_next: `Schedule the next interview round (Round ${nextRound})?`,
            placed: "Are you sure you want to mark this candidate as Placed?",
            rejected: "Are you sure you want to mark this candidate as Rejected?",
        };

        if (!window.confirm(messages[action])) return;

        setSaving(true);
        setError("");

        try {
            if (action === "reschedule") {
                await interviewScheduleService.rescheduleInterview(
                    interviewId,
                    requestPayload()
                );
                window.alert(`Round ${currentRound} rescheduled successfully.`);
            } else if (action === "complete") {
                await interviewScheduleService.completeInterview(interviewId);
                window.alert(`Round ${currentRound} marked as Completed.`);
            } else if (action === "schedule_next") {
                await interviewScheduleService.scheduleNextRound(
                    interviewId,
                    requestPayload()
                );
                window.alert(`Round ${nextRound} scheduled successfully.`);
            } else if (action === "placed" || action === "rejected") {
                await interviewScheduleService.setInterviewDecision(
                    interviewId,
                    action === "placed" ? "Placed" : "Rejected"
                );
                if (action === "placed") {
                    navigate(`/consultancy/add-payment-info/${interviewId}`);
                    return;
                }
                window.alert(
                    "Candidate marked as Rejected."
                );
            }

            navigate("/consultancy/interview-schedule");
        } catch (actionError) {
            setError(
                actionError.message || "Could not update this interview."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section id="main-content">
                <p>Loading interview details...</p>
            </section>
        );
    }

    if (error && !current) {
        return (
            <section id="main-content">
                <p>{error}</p>
                <button
                    type="button"
                    className="refollowup-clear-btn"
                    onClick={() =>
                        navigate("/consultancy/interview-schedule")
                    }
                >
                    Back to Interview Schedule
                </button>
            </section>
        );
    }

    if (!current) return null;

    return (
        <section id="main-content">
            <div className="next-round-page">
                <div className="next-round-header">
                    <h1>Schedule Next Interview Round</h1>
                    <span>Consultancy Management</span>
                    <strong className="candidate-name">
                        {current.candidateName || "N/A"}
                    </strong>
                </div>

                <div className="current-round">
                    <div className="round-buttons">
                        {rounds.map((round, index) => (
                            <button
                                type="button"
                                className="round-small-btn"
                                key={round.interviewId}
                                onClick={() => {
                                    setSelectedRoundIndex(index);
                                    setRoundsModalOpen(true);
                                }}
                            >
                                Round {round.interviewRound}
                            </button>
                        ))}
                    </div>

                    <div className="round-info-row">
                        <div className="round-info next-round-info">
                            <span>
                                {isCompleted ? "NEXT ROUND" : "CURRENT ROUND"}
                            </span>
                            <strong>
                                Round {isCompleted ? nextRound : currentRound}
                            </strong>
                        </div>

                        <div className="round-info">
                            <span>STATUS</span>
                            <strong>{interviewStatusLabel}</strong>
                        </div>
                    </div>
                </div>

                {roundsModalOpen && (
                    <div
                        id="roundsModal"
                        className="rounds-modal"
                        style={{ display: "flex" }}
                        onClick={(event) => {
                            if (event.target === event.currentTarget) {
                                setRoundsModalOpen(false);
                            }
                        }}
                    >
                        <div className="rounds-modal-content">
                            <div className="rounds-modal-header">
                                <h3>Interview Rounds</h3>
                                <button
                                    type="button"
                                    onClick={() => setRoundsModalOpen(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="round-details">
                                {rounds.map((round, index) => (
                                    <div
                                        className="round-detail"
                                        key={round.interviewId}
                                        style={{
                                            display:
                                                selectedRoundIndex === index
                                                    ? "block"
                                                    : "none",
                                        }}
                                    >
                                        <div className="round-detail-title">
                                            <h4>
                                                Interview {round.interviewRound}
                                            </h4>
                                            <span className="round-status">
                                                {round.interviewStatus}
                                            </span>
                                        </div>

                                        <div className="round-detail-grid">
                                            <div className="round-box">
                                                <span>Candidate</span>
                                                <strong>{round.candidateName || "N/A"}</strong>
                                            </div>
                                            <div className="round-box">
                                                <span>Company</span>
                                                <strong>{round.companyName || "N/A"}</strong>
                                            </div>
                                            <div className="round-box">
                                                <span>Position</span>
                                                <strong>{round.position || "N/A"}</strong>
                                            </div>
                                            <div className="round-box">
                                                <span>Interview Round</span>
                                                <strong>Interview {round.interviewRound}</strong>
                                            </div>
                                            <div className="round-box">
                                                <span>Interview Date</span>
                                                <strong>{round.interviewDate || "N/A"}</strong>
                                            </div>
                                            <div className="round-box">
                                                <span>Interview Time</span>
                                                <strong>{round.interviewTime || "N/A"}</strong>
                                            </div>
                                            <div className="round-box">
                                                <span>Managed By / HR</span>
                                                <strong>{round.hrName || "N/A"}</strong>
                                            </div>
                                            <div className="round-box">
                                                <span>Remark</span>
                                                <strong>{round.remark || "N/A"}</strong>
                                            </div>
                                            <div className="round-box">
                                                <span>Status</span>
                                                <strong>{round.interviewStatus || "N/A"}</strong>
                                            </div>
                                            <div className="round-box">
                                                <span>Next Round</span>
                                                <strong>
                                                    Interview {Number(round.interviewRound) + 1}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={(event) => event.preventDefault()}
                    noValidate
                >
                    {error && <p role="alert">{error}</p>}

                    <label>Company Name:</label>
                    <input
                        type="text"
                        className="refollowup-input"
                        value={current.companyName || ""}
                        readOnly
                    />

                    <label>Position:</label>
                    <input
                        type="text"
                        className="refollowup-input"
                        value={current.position || ""}
                        readOnly
                    />

                    <label>Interview Round:</label>
                    <input
                        type="text"
                        className="refollowup-input"
                        value={`Round ${isCompleted ? nextRound : currentRound}`}
                        readOnly
                    />

                    <div className="date-time-row">
                        <div className="form-group-small">
                            <label>Interview Date</label>
                            <input
                                type="date"
                                className="refollowup-input"
                                value={interviewDate}
                                onChange={(event) =>
                                    setInterviewDate(event.target.value)
                                }
                                required={!isFinal}
                                disabled={isFinal}
                            />
                        </div>

                        <div className="form-group-small">
                            <label>Interview Time</label>
                            <input
                                type="time"
                                className="refollowup-input"
                                value={interviewTime}
                                onChange={(event) =>
                                    setInterviewTime(event.target.value)
                                }
                                required={!isFinal}
                                disabled={isFinal}
                            />
                        </div>
                    </div>

                    <label>Managed By / HR Name:</label>
                    <input
                        type="text"
                        className="refollowup-input"
                        value={hrName}
                        onChange={(event) => setHrName(event.target.value)}
                        required={!isFinal}
                        disabled={isFinal}
                    />

                    <label>Remark:</label>
                    <textarea
                        className="refollowup-input"
                        name="remark"
                        rows="3"
                        value={remark}
                        onChange={(event) => setRemark(event.target.value)}
                        disabled={isFinal}
                    />

                    {!isFinal && (
                        <>
                            <div
                                className={`schedule-dropdown-wrapper ${
                                    scheduleMenuOpen ? "open" : ""
                                }`}
                            >
                                <button
                                    type="button"
                                    className="refollowup-search-btn schedule-dropdown-btn"
                                    onClick={() =>
                                        setScheduleMenuOpen((open) => !open)
                                    }
                                    disabled={saving}
                                >
                                    📅 {isCompleted ? `Schedule Round ${nextRound}` : "Schedule"}
                                    <span className="schedule-arrow">▼</span>
                                </button>

                                <div
                                    id="scheduleDropdown"
                                    className="schedule-dropdown-menu"
                                >
                                    {isCompleted ? (
                                        <button
                                            type="button"
                                            className="schedule-dropdown-item"
                                            onClick={() =>
                                                handleAction("schedule_next")
                                            }
                                        >
                                            📅 Schedule Round {nextRound}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="schedule-dropdown-item reschedule-option"
                                                onClick={() =>
                                                    handleAction("reschedule")
                                                }
                                            >
                                                ↻ Reschedule
                                            </button>
                                            <button
                                                type="button"
                                                className="schedule-dropdown-item complete-option"
                                                onClick={() =>
                                                    handleAction("complete")
                                                }
                                            >
                                                ✓ Completed
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                className="refollowup-clear-btn"
                                onClick={() =>
                                    navigate("/consultancy/interview-schedule")
                                }
                            >
                                Cancel
                            </button>
                        </>
                    )}

                    {!isFinal && (
                        <div className="final-decision">
                            <h4>Candidate Final Decision</h4>
                            <button
                                type="button"
                                className="btn btn-success placed-btn"
                                disabled={saving}
                                onClick={() => handleAction("placed")}
                            >
                                ✓ Placed
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger rejected-btn"
                                disabled={saving}
                                onClick={() => handleAction("rejected")}
                            >
                                × Rejected
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
};

export default UpdateInterviewSchedule;
