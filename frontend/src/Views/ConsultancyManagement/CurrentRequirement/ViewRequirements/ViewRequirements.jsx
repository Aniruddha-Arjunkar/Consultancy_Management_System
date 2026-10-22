import { useEffect, useMemo, useRef, useState } from "react";
import currentRequirementService from "../../../../services/currentRequirementService";
import "./ViewRequirements.css";
import { useNavigate } from "react-router";

const ViewRequirements = () => {
    const [requirements, setRequirements] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const tableWrapperRef = useRef(null);
    const bottomScrollRef = useRef(null);
    const bottomScrollInnerRef = useRef(null);

    const [closingRequirementId, setClosingRequirementId] = useState(null);


    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        const loadRequirements = async () => {
            setLoading(true);
            setError("");

            try {
                const data =
                    await currentRequirementService.getCurrentRequirements();

                if (active) {
                    setRequirements(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    const message =
                        loadError.message || "Could not load requirements.";
                    setError(message);
                    window.alert(message);
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
                requirement.skillsRequired,
                requirement.education,
                requirement.openDate,
                requirement.closeDate,
                requirement.selectCandidate,
                requirement.jobDescription,
            ]
                .filter((value) => value !== null && value !== undefined)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [requirements, search]);

    useEffect(() => {
        const wrapper = tableWrapperRef.current;
        const bottomScroll = bottomScrollRef.current;
        const bottomInner = bottomScrollInnerRef.current;

        if (!wrapper || !bottomScroll || !bottomInner) return undefined;

        const updateScrollWidth = () => {
            bottomInner.style.width = `${wrapper.scrollWidth}px`;
        };

        const syncBottomToTable = () => {
            wrapper.scrollLeft = bottomScroll.scrollLeft;
        };

        const syncTableToBottom = () => {
            bottomScroll.scrollLeft = wrapper.scrollLeft;
        };

        updateScrollWidth();
        window.addEventListener("resize", updateScrollWidth);
        bottomScroll.addEventListener("scroll", syncBottomToTable);
        wrapper.addEventListener("scroll", syncTableToBottom);

        return () => {
            window.removeEventListener("resize", updateScrollWidth);
            bottomScroll.removeEventListener("scroll", syncBottomToTable);
            wrapper.removeEventListener("scroll", syncTableToBottom);
        };
    }, [filteredRequirements, loading]);


    const handleCloseRequirement = async (requirement) => {
        const confirmed = window.confirm(
            `Close the requirement "${requirement.jobProfile}" for ${requirement.companyName}?`
        );

        if (!confirmed) return;

        setClosingRequirementId(requirement.id);

        try {
            await currentRequirementService.closeCurrentRequirement(
                requirement.id
            );

            setRequirements((current) =>
                current.filter((item) => item.id !== requirement.id)
            );

            window.alert("Requirement closed successfully ✅.");
        } catch (error) {
            window.alert(error.message || "Could not close requirement ❌.");
        } finally {
            setClosingRequirementId(null);
        }
    };

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page requirements-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    📋
                                </span>
                                View Current Requirements
                            </h1>
                            <p className="view-clients-subtitle">
                                View and manage current associate-company job
                                requirements
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {requirements.length}{" "}
                            {requirements.length === 1 ? "record" : "records"}
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
                                    placeholder="Search company, job profile, skills..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    autoComplete="off"
                                    aria-label="Search requirements"
                                />
                            </div>
                        </div>

                        {loading && (
                            <p className="requirement-list-state">
                                Loading current requirements...
                            </p>
                        )}

                        {!loading && error && (
                            <p className="requirement-list-state requirement-list-error">
                                {error}
                            </p>
                        )}

                        {!loading && !error && (
                            <>
                                <div
                                    className="view-clients-table-wrapper"
                                    ref={tableWrapperRef}
                                >
                                    <table className="view-clients-table requirement-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Company Name</th>
                                                <th>Job Profile</th>
                                                <th>Position Level</th>
                                                <th>Years of Experience</th>
                                                <th>Skills Required</th>
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
                                                            <td className="view-client-sr">
                                                                {index + 1}
                                                            </td>
                                                            <td className="view-client-name" style={{ fontWeight: '700' }}>
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
                                                                {requirement.skillsRequired ||
                                                                    "—"}
                                                            </td>
                                                            <td style={{ fontWeight: '600' }}>
                                                                {requirement.openDate ||
                                                                    "—"}
                                                            </td>
                                                            <td style={{ fontWeight: '600' }}>
                                                                {requirement.closeDate ||
                                                                    "—"}
                                                            </td>
                                                            <td>
                                                                {requirement.selectCandidate ??
                                                                    0}
                                                            </td>

                                                            <td className="requirement-actions">
                                                                <div className="requirement-action-buttons">
                                                                    <button
                                                                        type="button"
                                                                        className="view-client-view-btn"
                                                                        onClick={() =>
                                                                            navigate(`/consultancy/view-requirement-detail/${requirement.id}`)
                                                                        }>
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="view-client-defaulter-btn"
                                                                        onClick={() => handleCloseRequirement(requirement)}
                                                                        disabled={closingRequirementId === requirement.id}
                                                                    >
                                                                        {closingRequirementId === requirement.id ? "Closing..." : "Close"}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="10"
                                                        className="view-client-no-data"
                                                    >
                                                        {requirements.length ===
                                                            0
                                                            ? "No current requirements found."
                                                            : "No matching requirements found."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div
                                    className="view-client-bottom-scroll"
                                    ref={bottomScrollRef}
                                    aria-label="Scroll table horizontally"
                                >
                                    <div
                                        className="view-client-bottom-scroll-inner"
                                        ref={bottomScrollInnerRef}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </section>
    );
};
export default ViewRequirements;