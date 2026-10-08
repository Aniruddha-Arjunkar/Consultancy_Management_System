import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import "./TopBar.css";


function TopBar() {

    const { user , logout} = useAuth();

    const [profileOpen, setProfileOpen] = useState(false);


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
                        <span className="shul-search-icon">
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Search clients..."
                        />
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