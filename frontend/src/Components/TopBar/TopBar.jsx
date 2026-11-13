import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import associateCompanyService from "../../services/associateCompanyService";
import studentRegistrationService from "../../services/studentRegistrationService";
import agreementService from "../../services/agreementService";

import "./TopBar.css";


const normalize = (value) => String(value ?? "").trim().toLowerCase();

function buildSearchResults(data, query) {
    const groups = [
        {
            type: "Associate companies",
            records: data.companies,
            fields: ["companyName", "location", "contactPerson", "phone", "email"],
            getTitle: (record) => record.companyName,
            getDetail: (record) =>
                [record.contactPerson, record.location].filter(Boolean).join(" · "),
            getPath: (record) =>
                `/consultancy/view-associate-details/${record.id}`,
        },
        {
            type: "Students",
            records: data.students,
            fields: ["name", "phone", "email", "skills", "jobProfile"],
            getTitle: (record) => record.name,
            getDetail: (record) =>
                [record.phone, record.email].filter(Boolean).join(" · "),
            getPath: (record) =>
                `/consultancy/view-student-detail/${record.id}`,
        },
        {
            type: "Candidates",
            records: data.candidates,
            fields: ["name", "phone", "email", "skills", "jobProfile", "status"],
            getTitle: (record) => record.name,
            getDetail: (record) =>
                [record.phone, record.email, record.status]
                    .filter(Boolean)
                    .join(" · "),
            getPath: (record) =>
                `/consultancy/view-candidate-detail/${record.id}`,
        },
    ];

    return groups.flatMap((group) =>
        group.records
            .filter((record) =>
                group.fields.some((field) =>
                    normalize(record[field]).includes(query)
                )
            )
            .slice(0, 5)
            .map((record) => ({
                type: group.type,
                id: record.id,
                title: group.getTitle(record) || "Unnamed record",
                detail: group.getDetail(record),
                path: group.getPath(record),
            }))
    );
}


function TopBar() {

    const { user, logout } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();


    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");

    const searchDataRef = useRef(null);

    const loadSearchData = () => {
        if (!searchDataRef.current) {
            searchDataRef.current = Promise.allSettled([
                associateCompanyService.getAssociateCompanies(),
                studentRegistrationService.getStudents(),
                agreementService.getCandidates(),
            ]).then((responses) => {
                const data = {
                    companies:
                        responses[0].status === "fulfilled"
                            ? responses[0].value
                            : [],
                    students:
                        responses[1].status === "fulfilled"
                            ? responses[1].value
                            : [],
                    candidates:
                        responses[2].status === "fulfilled"
                            ? responses[2].value
                            : [],
                };

                if (!responses.some((response) => response.status === "fulfilled")) {
                    throw new Error("Search results could not be loaded.");
                }
                return data;
            });
        }
        return searchDataRef.current;
    };


    const today = new Date();

    const formattedDate =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    const userName = user?.name || "Admin";
    const userRole = user?.role || "Admin";

    const userInitial = userName.charAt(0).toUpperCase();

    useEffect(() => {
    const query = normalize(searchQuery);

    if (query.length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        setSearchError("");
        return undefined;
    }

    let cancelled = false;

    setSearchOpen(true);
    setSearchLoading(true);
    setSearchError("");

    const timer = window.setTimeout(async () => {
        try {
            const data = await loadSearchData();

            if (!cancelled) {
                setSearchResults(buildSearchResults(data, query));
            }
        } catch (error) {
            if (!cancelled) {
                setSearchResults([]);
                setSearchError(error.message || "Search failed.");
                searchDataRef.current = null;
            }
        } finally {
            if (!cancelled) {
                setSearchLoading(false);
            }
        }
    }, 250);

    return () => {
        cancelled = true;
        window.clearTimeout(timer);
    };
}, [searchQuery]);

    return (
        <header className="shul-header">

            {/* =================================================
                HEADER CONTENT
            ================================================== */}

            <div className="shul-header-content">

                {/* GREETING */}
                <div className="shul-header-greeting">
                    <div className="shul-greeting-title">
                        Good Morning,{" "}
                        {userName}
                        {" "}👋
                    </div>

                    <div className="shul-greeting-date">
                        {formattedDate}
                    </div>
                </div>


                {/* ACTIONS */}
                <div className="shul-header-actions">
                    {/* SEARCH */}

                    <div className="shul-search-wrap">
    <span className="shul-search-icon" aria-hidden="true">
        🔍
    </span>

    <input
        type="search"
        value={searchQuery}
        placeholder="Search companies, students, candidates..."
        aria-label="Search companies, students, and candidates"
        aria-expanded={searchOpen && normalize(searchQuery).length >= 2}
        aria-controls="shul-search-results"
        onChange={(event) => {
            setSearchQuery(event.target.value);
            setSearchOpen(true);
        }}
        onKeyDown={(event) => {
            if (event.key === "Escape") {
                setSearchOpen(false);
            }
        }}
    />

    {searchOpen && normalize(searchQuery).length >= 2 && (
        <div
            id="shul-search-results"
            className="shul-search-results"
            role="listbox"
        >
            {searchLoading ? (
                <div className="shul-search-message">Searching…</div>
            ) : searchError ? (
                <div className="shul-search-message shul-search-error">
                    {searchError}
                </div>
            ) : searchResults.length === 0 ? (
                <div className="shul-search-message">No matching records</div>
            ) : (
                searchResults.map((result) => (
                    <button
                        type="button"
                        className="shul-search-result"
                        key={`${result.type}-${result.id}`}
                        role="option"
                        onClick={() => {
                            setSearchQuery("");
                            setSearchOpen(false);
                            navigate(result.path);
                        }}
                    >
                        <span className="shul-search-result-copy">
                            <strong>{result.title}</strong>
                            <small>{result.detail || result.type}</small>
                        </span>
                        <span className="shul-search-result-type">
                            {result.type}
                        </span>
                    </button>
                ))
            )}
        </div>
    )}
</div>

                    {/* LIVE */}
                    <div className="shul-live-badge">
                        <span></span>
                        Live
                    </div>

                    {/* CHAT */}
                    <button
                        type="button"
                        className="shul-icon-button"
                        title="Chat"
                    >
                        💬
                    </button>

                    {/* NOTIFICATION */}
                    <button
                        type="button"
                        className="shul-icon-button"
                        title="Notifications"
                    >
                        🔔
                    </button>


                    {/* PROFILE */}
                    <div className="shul-profile-wrap">

                        <button
                            type="button"
                            className="shul-profile-button"
                            onClick={() =>
                                setProfileOpen(
                                    previous =>
                                        !previous
                                )
                            }>

                            <span className="shul-avatar">
                                {userInitial}
                            </span>

                            <span className="shul-profile-copy">
                                <strong>
                                    {userName}
                                </strong>
                                <small>
                                    {userRole}
                                </small>
                            </span>
                            <span className="shul-profile-arrow">
                                ▼
                            </span>
                        </button>


                        {profileOpen && (

                            <div className="shul-profile-menu open">
                                <button
                                    type="button"
                                    className="profile-menu-item"
                                    onClick={() => {
                                        navigate("/profile");
                                    }}
                                >
                                    👤 &nbsp; Profile
                                </button>

                                <button
                                    type="button"
                                    className="profile-menu-item danger"
                                    onClick={handleLogout}
                                >
                                    ↪ &nbsp; Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
export default TopBar;