import { useEffect, useMemo, useState } from "react";
import interviewScheduleService from "../../../../services/interviewScheduleService";
import "./PlacedCandidates.css";

const PlacedCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadCandidates = async () => {
            try {
                const data =
                    await interviewScheduleService.getPlacedCandidates();

                if (active) {
                    setCandidates(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load placed candidates."
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
                candidate.phone,
                candidate.email,
                candidate.companyName,
                candidate.position,
                candidate.joiningDate,
                candidate.salaryPackage,
                candidate.status,
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
                            Placed Candidate
                        </h1>
                    </div>
                </div>

                <div className="view-clients-card">
                    <div className="view-client-search-wrap">
                        <span className="view-client-search-icon">🔍</span>
                        <input
                            type="text"
                            id="txt_searchall"
                            className="view-client-search search"
                            placeholder="Search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            autoComplete="off"
                            aria-label="Search placed candidates"
                        />
                    </div>

                    <br />

                    {loading && <p>Loading placed candidates...</p>}
                    {!loading && error && <p role="alert">{error}</p>}

                    {!loading && !error && (
                        <div className="view-clients-table-wrapper">
                            <table
                                className="view-clients-table"
                                id="placed-candidate-table"
                            >
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: "180px" }}>Name</th>
                                        <th style={{ minWidth: "150px" }}>Mobile No.</th>
                                        <th style={{ minWidth: "240px" }}>Email</th>
                                        <th style={{ minWidth: "170px" }}>Comapany Name</th>
                                        <th>Position</th>
                                        <th>Joining Date</th>
                                        <th>Package</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.length > 0 ? (
                                        filteredCandidates.map((candidate) => (
                                            <tr key={candidate.interviewId}>
                                                <td style={{ minWidth: "180px" }}>
                                                    {candidate.name || "—"}
                                                </td>
                                                <td style={{ minWidth: "150px" }}>
                                                    {candidate.phone || "—"}
                                                </td>
                                                <td style={{ minWidth: "240px" }}>
                                                    {candidate.email || "—"}
                                                </td>
                                                <td style={{ minWidth: "170px" }}>
                                                    {candidate.companyName || "—"}
                                                </td>
                                                <td>{candidate.position || "—"}</td>
                                                <td>{candidate.joiningDate || "—"}</td>
                                                <td>{candidate.salaryPackage || "—"}</td>
                                                <td>{candidate.status || "—"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="view-client-no-data"
                                            >
                                                No placed candidates found.
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
export default PlacedCandidates;