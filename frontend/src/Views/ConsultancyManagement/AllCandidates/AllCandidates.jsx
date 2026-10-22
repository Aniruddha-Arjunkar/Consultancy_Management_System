import { useEffect, useMemo, useState } from "react";
import agreementService from "../../../services/agreementService";
import "./AllCandidates.css";

const AllCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadCandidates = async () => {
            try {
                const data = await agreementService.getCandidates();
                if (active) {
                    setCandidates(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    const message =
                        loadError.message || "Could not load candidates.";
                    setError(message);
                    window.alert(message);
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
                candidate.phone,
                candidate.email,
                candidate.jobProfile,
                candidate.status,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [candidates, search]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page all-candidate-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    🎓
                                </span>
                                All Candidates
                            </h1>
                            <p className="view-clients-subtitle">
                                View candidates and their PCA agreement status
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {candidates.length}{" "}
                            {candidates.length === 1 ? "candidate" : "candidates"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-clients-filter">
                            <div className="view-client-search-wrap">
                                <span className="view-client-search-icon">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    className="view-client-search"
                                    placeholder="Search name, phone, job profile, status..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    autoComplete="off"
                                    aria-label="Search candidates"
                                />
                            </div>
                        </div>

                        {loading && <p>Loading candidates...</p>}
                        {!loading && error && <p>{error}</p>}

                        {!loading && !error && (
                            <div className="view-clients-table-wrapper">
                                <table className="view-clients-table">
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Name</th>
                                            <th>Mobile No.</th>
                                            <th>Email</th>
                                            <th>Job Profile</th>
                                            <th>Agreement Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCandidates.length > 0 ? (
                                            filteredCandidates.map(
                                                (candidate, index) => (
                                                    <tr key={candidate.id}>
                                                        <td>{index + 1}</td>
                                                        <td className="view-client-name">
                                                            {candidate.name || "—"}
                                                        </td>
                                                        <td>
                                                            {candidate.phone || "—"}
                                                        </td>
                                                        <td>
                                                            {candidate.email || "—"}
                                                        </td>
                                                        <td>
                                                            {candidate.jobProfile || "—"}
                                                        </td>
                                                        <td>
                                                            {candidate.agreementDate || "—"}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`candidate-status ${
                                                                    candidate.status === "Agreed"
                                                                        ? "candidate-status-agreed"
                                                                        : "candidate-status-not-agreed"
                                                                }`}
                                                            >
                                                                {candidate.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="view-client-no-data"
                                                >
                                                    No candidates found.
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

export default AllCandidates;