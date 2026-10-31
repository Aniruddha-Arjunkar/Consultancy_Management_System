import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import interviewScheduleService from "../../../../services/interviewScheduleService";

const ReScheduleRejectedCandidateInterview = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [requirements, setRequirements] = useState([]);
    const [companyName, setCompanyName] = useState("");
    const [requirementId, setRequirementId] = useState("");
    const [form, setForm] = useState({
        interviewRound: "1",
        interviewDate: "",
        interviewTime: "",
        hrName: "",
        remark: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
 

    useEffect(() => {
        let active = true;

        const loadRequirements = async () => {
            try {
                const data =
                    await interviewScheduleService
                        .getRejectedRescheduleRequirements();

                if (active) {
                    setRequirements(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    window.alert(loadError.message ||  "Could not load current requirements.")
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadRequirements();

        return () => {
            active = false;
        };
    }, []);

    const companies = useMemo(
        () =>
            [...new Set(requirements.map((item) => item.companyName))]
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b)),
        [requirements]
    );

    const companyRequirements = useMemo(
        () => requirements.filter((item) => item.companyName === companyName),
        [requirements, companyName]
    );

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (saving) return;

        setSaving(true);
        

        try {
            await interviewScheduleService
                .rescheduleRejectedCandidateInterview(interviewId, {
                    requirementId: Number(requirementId),
                    interviewRound: Number(form.interviewRound),
                    interviewDate: form.interviewDate,
                    interviewTime: form.interviewTime,
                    hrName: form.hrName.trim(),
                    remark: form.remark.trim(),
                });

            window.alert("Interview rescheduled successfully.");
            navigate("/consultancy/rejected-candidates");
        } catch (submitError) {
            window.alert(submitError.message  || "Could not reschedule this interview .")
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading current requirements...</p>
                </section>
            </section>
        );
    }

    return (
        <section id="main-content">
            <section className="">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">📞</span>
                                <div>
                                    <h2>Reschedule Interview</h2>
                                    <p>Update interview details</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="company_name">
                                        Company Name
                                    </label>
                                    <select
                                        id="company_name"
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
                                        Job Profile
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
                                        <option value="">
                                            Select Job Profile
                                        </option>
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
                                    <label htmlFor="interview_round">
                                        Interview Round
                                    </label>
                                    <select
                                        id="interview_round"
                                        name="interviewRound"
                                        value={form.interviewRound}
                                        onChange={updateField}
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
                                    <label htmlFor="interview_date">
                                        Interview Date
                                    </label>
                                    <input
                                        type="date"
                                        id="interview_date"
                                        name="interviewDate"
                                        value={form.interviewDate}
                                        onChange={updateField}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="interview_time">
                                        Interview Time
                                    </label>
                                    <input
                                        type="time"
                                        id="interview_time"
                                        name="interviewTime"
                                        value={form.interviewTime}
                                        onChange={updateField}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="hr_name">Managed By</label>
                                    <input
                                        type="text"
                                        id="hr_name"
                                        name="hrName"
                                        placeholder="Enter HR name"
                                        value={form.hrName}
                                        onChange={updateField}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="remark">Remark</label>
                                    <input
                                        type="text"
                                        id="remark"
                                        name="remark"
                                        placeholder="Enter remark"
                                        value={form.remark}
                                        onChange={updateField}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={saving || !requirementId}
                                    >
                                        📅{" "}
                                        {saving
                                            ? "Rescheduling..."
                                            : "Reschedule Interview"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default ReScheduleRejectedCandidateInterview;