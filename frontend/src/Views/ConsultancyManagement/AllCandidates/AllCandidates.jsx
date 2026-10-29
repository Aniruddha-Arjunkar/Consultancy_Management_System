import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import agreementService from "../../../services/agreementService";
import "./AllCandidates.css";


const AllCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState("ALL");

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
                    setError(loadError.message || "Could not load candidates.");
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

        return candidates.filter((candidate) => {
            const matchesStatus =
                statusFilter === "ALL" || candidate.status === statusFilter;

            const matchesSearch =
                !query ||
                [
                    candidate.name,
                    candidate.phone,
                    candidate.email,
                    candidate.experienceDescription,
                    candidate.skills,
                    candidate.status,
                    candidate.jobProfile,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [candidates, search, statusFilter]);

    const getStatusClass = (status) => {
        if (status === "Blacklisted") return "candidate-status-blacklisted";
        if (status === "Agreed") return "candidate-status-agreed";
        return "candidate-status-not-agreed";
    };

    const getStatusLabel = (status) => {
        if (status === "Blacklisted") return "Blacklisted";
        if (status === "Agreed") return "Agreed";
        return "Not Agreed";
    };

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page all-candidate-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    👨‍💼
                                </span>
                                View All Candidates
                            </h1>

                            <p className="view-clients-subtitle">
                                View and manage all candidate records
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {filteredCandidates.length}{" "}
                            {filteredCandidates.length === 1 ? "record" : "records"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="all-candidate-toolbar">
                            <div className="view-client-search-wrap">
                                <span className="view-client-search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    className="view-client-search"
                                    placeholder="Search name, mobile, email, skills..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    autoComplete="off"
                                    aria-label="Search candidates"
                                />
                            </div>

                            <div className="all-candidate-actions">
                                <button
                                    type="button"
                                    className={`all-candidate-action-btn all-candidate-action-all ${statusFilter === "ALL" ? "is-active" : ""
                                        }`}
                                    onClick={() => setStatusFilter("ALL")}
                                    aria-pressed={statusFilter === "ALL"}
                                >
                                    All Candidates
                                </button>

                                <button
                                    type="button"
                                    className={`all-candidate-action-btn all-candidate-action-blacklisted ${statusFilter === "Blacklisted" ? "is-active" : ""
                                        }`}
                                    onClick={() => setStatusFilter("Blacklisted")}
                                    aria-pressed={statusFilter === "Blacklisted"}
                                >
                                    Blacklisted Candidate
                                </button>

                                <button
                                    type="button"
                                    className={`all-candidate-action-btn all-candidate-action-pca ${statusFilter === "Agreed" ? "is-active" : ""
                                        }`}
                                    onClick={() => setStatusFilter("Agreed")}
                                    aria-pressed={statusFilter === "Agreed"}
                                >
                                    PCA Agreed
                                </button>

                                <button
                                    type="button"
                                    className={`all-candidate-action-btn all-candidate-action-non-pca ${statusFilter === "Not Agreed" ? "is-active" : ""
                                        }`}
                                    onClick={() => setStatusFilter("Not Agreed")}
                                    aria-pressed={statusFilter === "Not Agreed"}
                                >
                                    Non-PCA Agreed
                                </button>
                            </div>
                        </div>

                        {loading && <p>Loading candidates...</p>}
                        {!loading && error && <p>{error}</p>}

                        {!loading && !error && (
                            <div className="view-clients-table-wrapper">
                                <table className="view-clients-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Mobile No.</th>
                                            <th>Email</th>
                                            <th>Experience</th>
                                            <th>Skills</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredCandidates.length > 0 ? (
                                            filteredCandidates.map(
                                                (candidate, index) => (
                                                    <tr key={candidate.id}>
                                                        <td className="view-client-sr">
                                                            {index + 1}
                                                        </td>

                                                        <td className="view-client-name" style={{ fontWeight: '600' }}>
                                                            {candidate.name || "—"}
                                                        </td>

                                                        <td>
                                                            {candidate.phone || "—"}
                                                        </td>

                                                        <td>
                                                            {candidate.email || "—"}
                                                        </td>

                                                        <td>
                                                            {candidate.experienceDescription || "—"}
                                                        </td>

                                                        <td>
                                                            {candidate.skills || "—"}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`candidate-status ${getStatusClass(
                                                                    candidate.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    candidate.status
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="view-client-view-btn"
                                                                onClick={() =>
                                                                    navigate(`/consultancy/view-candidate-detail/${candidate.id}`)
                                                                }
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={8}
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