import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import interviewScheduleService from "../../../../services/interviewScheduleService";
import "./InterviewScheduled.css";

const InterviewScheduled = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadInterviews = async () => {
            try {
                const data =
                    await interviewScheduleService.getScheduledInterviews();

                if (active) {
                    setInterviews(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load interview schedules."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadInterviews();

        return () => {
            active = false;
        };
    }, []);

    const filteredInterviews = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return interviews;

        return interviews.filter((item) =>
            [
                item.candidateName,
                item.companyName,
                item.position,
                item.interviewDate,
                item.interviewTime,
                item.hrName,
                item.remark,
                item.interviewStatus,
                item.interviewRound,
            ]
                .filter((value) => value !== null && value !== undefined)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [interviews, search]);

    return (
        <section id="main-content">
             <section className="wrapper">
            <div className="view-clients-page interview-scheduled-page">
                <div className="view-clients-header">
                    <div className="view-clients-title-wrap">
                        <h1 className="view-clients-title">
                            <span className="view-clients-title-icon">📅</span>
                            Interview Schedule Student
                        </h1>
                        <p className="view-clients-subtitle">
                            View scheduled candidate interviews
                        </p>
                    </div>

                    <span className="view-clients-count">
                        {filteredInterviews.length}{" "}
                        {filteredInterviews.length === 1 ? "record" : "records"}
                    </span>
                </div>

                <div className="view-clients-card">
                    <div className="view-clients-filter">
                        <div className="view-client-search-wrap">
                            <span className="view-client-search-icon">🔍</span>
                            <input
                                type="text"
                                className="view-client-search"
                                placeholder="Search candidate, company, position..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                autoComplete="off"
                                aria-label="Search interview schedules"
                            />
                        </div>
                    </div>

                    {loading && <p>Loading interview schedules...</p>}
                    {!loading && error && <p>{error}</p>}

                    {!loading && !error && (
                        <div className="view-clients-table-wrapper">
                            <table className="view-clients-table">
                                <thead>
                                    <tr>
                                        <th>Sr. No.</th>
                                        <th>Candidate Name</th>
                                        <th>Company Name</th>
                                        <th>Position</th>
                                        <th>Interview Date</th>
                                        <th>Interview Time</th>
                                        <th>Managed By</th>
                                        <th>Remark</th>
                                        <th>Interview Round</th>
                                        <th>Interview Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInterviews.length > 0 ? (
                                        filteredInterviews.map((item, index) => (
                                            <tr key={item.interviewId}>
                                                <td>{index + 1}</td>
                                                <td className="view-client-name" style={{ fontWeight: '700' }}>
                                                    {item.candidateName || "—"}
                                                </td>
                                                <td>{item.companyName || "—"}</td>
                                                <td className="view-client-service">
                                                    {item.position || "—"}
                                                </td>
                                                <td className="view-client-date-cell" style={{ fontWeight: '600' }}>
                                                    {item.interviewDate || "—"}
                                                </td>
                                                <td className="view-client-date-cell" style={{ fontWeight: '600' }}>
                                                    {item.interviewTime || "—"}
                                                </td>
                                                <td>{item.hrName || "—"}</td>
                                                <td>{item.remark || "—"}</td>
                                                <td style={{ fontWeight: '600' }}>Round {item.interviewRound}</td>
                                                <td style={{ fontWeight: '600' }}>{item.interviewStatus}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="view-client-view-btn"
                                                        onClick={() =>
                                                            navigate(`/consultancy/update-interview/${item.interviewId}`)
                                                        }>
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={11}
                                                className="view-client-no-data"
                                            >
                                                No interview schedules found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            </section>
        </section>
    );
};
export default InterviewScheduled;