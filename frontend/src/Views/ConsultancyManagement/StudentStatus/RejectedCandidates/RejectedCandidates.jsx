import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import interviewScheduleService from "../../../../services/interviewScheduleService";
import "./RejectedCandidates.css";

const RejectedCandidates = () => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadCandidates = async () => {
            try {
                const data =
                    await interviewScheduleService.getRejectedCandidates();

                if (active) {
                    setCandidates(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load rejected candidates."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadCandidates();

        return () => {
            active = false;
        };
    }, []);

    const filteredCandidates = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return candidates;

        return candidates.filter((candidate) =>
            [
                candidate.name,
                candidate.email,
                candidate.phone,
                candidate.interviewDate,
                candidate.position,
                candidate.rejectionReason,
                candidate.interviewStatus,
            ]
                .filter((value) => value !== null && value !== undefined)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [candidates, search]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                Rejected Candidate List
                            </h1>
                        </div>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-client-search-wrap">
                            <span className="view-client-search-icon">🔍</span>
                            <input
                                type="text"
                                id="txt_searchall"
                                className="view-client-search"
                                placeholder="Search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                autoComplete="off"
                                aria-label="Search rejected candidates"
                            />
                        </div>

                        <br />

                        {loading && <p>Loading rejected candidates...</p>}
                        {!loading && error && <p role="alert">{error}</p>}

                        {!loading && !error && candidates.length === 0 && (
                            <p className="view-client-no-data">
                                No rejected candidates found.
                            </p>
                        )}

                        {!loading && !error && candidates.length > 0 && (
                            <div className="view-clients-table-wrapper">
                                <table
                                    className="view-clients-table"
                                    id="rejectedCandidatesTable"
                                >
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "150px" }}>Name</th>
                                            <th style={{ minWidth: "250px" }}>Email</th>
                                            <th style={{ minWidth: "150px" }}>Phone</th>
                                            <th style={{ minWidth: "50px" }}>Interview Date</th>
                                            <th style={{ minWidth: "150px" }}>Position</th>
                                            <th style={{ minWidth: "220px" }}>Rejection Reason</th>
                                            <th style={{ minWidth: "100px" }}>Interview Status</th>
                                            <th style={{ minWidth: "200px" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCandidates.length > 0 ? (
                                            filteredCandidates.map((candidate) => (
                                                <tr key={candidate.interviewId}>
                                                    <td>{candidate.name || "—"}</td>
                                                    <td>{candidate.email || "—"}</td>
                                                    <td>{candidate.phone || "—"}</td>
                                                    <td>{candidate.interviewDate || "—"}</td>
                                                    <td>{candidate.position || "—"}</td>
                                                    <td>{candidate.rejectionReason || "—"}</td>
                                                    <td>{candidate.interviewStatus || "—"}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="Rejected-candidate-reschedule-btn"
                                                            onClick={() =>
                                                                navigate(`/consultancy/reschedule-rejected-interview/${candidate.interviewId}`)
                                                            }>
                                                            Reschedule Interview
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="view-client-no-data"
                                                >
                                                    No matching rejected candidates found.
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
export default RejectedCandidates;