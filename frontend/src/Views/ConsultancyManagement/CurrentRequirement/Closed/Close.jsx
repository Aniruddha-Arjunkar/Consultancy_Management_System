import { useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import currentRequirementService from "../../../../services/currentRequirementService";
import "./Close.css";

const Close = () => {
    const [requirements, setRequirements] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        const loadClosedRequirements = async () => {
            try {
                const data =
                    await currentRequirementService.getClosedRequirements();

                if (active) {
                    setRequirements(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    const message =
                        loadError.message ||
                        "Could not load closed requirements.";
                    setError(message);
                    window.alert(message);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadClosedRequirements();

        return () => {
            active = false;
        };
    }, []);

    const filteredRequirements = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return requirements;

        return requirements.filter((requirement) =>
            [
                requirement.companyName,
                requirement.location,
                requirement.jobProfile,
                requirement.positionLevel,
                requirement.yearsOfExperience,
                requirement.openDate,
                requirement.closeDate,
                requirement.selectCandidate,
            ]
                .filter((value) => value !== null && value !== undefined)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [requirements, search]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    🗑️
                                </span>
                                Closed Requirements
                            </h1>

                            <p className="view-clients-subtitle">
                                View all closed requirement records
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {requirements.length}{" "}
                            {requirements.length === 1 ? "record" : "records"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-clients-filter">
                            <div className="view-client-search-wrap" style={{ marginBlock: '10px' }}>
                                <span className="view-client-search-icon">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    className="view-client-search"
                                    placeholder="Search company, job profile, position..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    autoComplete="off"
                                    aria-label="Search closed requirements"
                                />
                            </div>
                        </div>

                        {loading && <p>Loading closed requirements...</p>}

                        {!loading && error && <p>{error}</p>}

                        {!loading && !error && (
                            <div className="view-clients-table-wrapper">
                                <table className="view-clients-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Company Name</th>
                                            <th>Job Profile</th>
                                            <th>Position Level</th>
                                            <th>Years of Experience</th>
                                            <th>Open Date</th>
                                            <th>Close Date</th>
                                            <th>Select Candidate</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredRequirements.length > 0 ? (
                                            filteredRequirements.map(
                                                (requirement, index) => (
                                                    <tr key={requirement.id}>
                                                        <td>{index + 1}</td>
                                                        <td style={{fontWeight:'700'}}>
                                                            {requirement.companyName ||
                                                                "—"}
                                                        </td>
                                                        <td>
                                                            {requirement.jobProfile ||
                                                                "—"}
                                                        </td>
                                                        <td>
                                                            {requirement.positionLevel ||
                                                                "—"}
                                                        </td>
                                                        <td>
                                                            {requirement.yearsOfExperience ||
                                                                "—"}
                                                        </td>
                                                        <td>
                                                            {requirement.openDate ||
                                                                "—"}
                                                        </td>
                                                        <td>
                                                            {requirement.closeDate ||
                                                                "—"}
                                                        </td>
                                                        <td>
                                                            {requirement.selectCandidate ??
                                                                0}
                                                        </td>
                                                        <td className="view-client-actions">
                                                            <button
                                                                type="button"
                                                                className="view-client-view-btn"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/consultancy/closed-requirement-detail/${requirement.id}`
                                                                    )
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
                                                    colSpan="8"
                                                    className="view-client-no-data"
                                                >
                                                    {requirements.length === 0
                                                        ? "No closed requirements found."
                                                        : "No matching requirements found."}
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
export default Close;