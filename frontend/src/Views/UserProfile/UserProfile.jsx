import { useAuth } from "../../context/AuthContext";
import "./UserProfile.css";

function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatStatus(value) {
    if (!value) {
        return "OFFLINE";
    }

    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function UserProfile() {
    const { user } = useAuth();

    const name =
        user?.name ||
        user?.email?.split("@")[0] ||
        "Admin";

    const role = user?.role || "-";
    const branch = user?.branch || "-";
    const status = formatStatus(user?.status);
    const isActive = user?.status?.toUpperCase() === "ACTIVE";

    const profileItems = [
        { label: "Full Name", value: name },
        { label: "Email Address", value: user?.email || "-" },
        { label: "Role", value: role, style: "role" },
        { label: "Branch", value: branch },
        { label: "Phone", value: user?.phone || "-" },
        { label: "Member Since", value: formatDate(user?.createdAt) },
        {
            label: "Account Status",
            value: status,
            style: isActive ? "active" : "inactive",
        },
    ];

    return (
        <section className="user-profile-page">
            <header className="user-profile-heading">
                <h1>👤 My Profile</h1>
                <p>View your account details and information</p>
            </header>

            <section className="user-profile-hero">
                <div className="user-profile-avatar" aria-hidden="true">
                    {name.charAt(0).toUpperCase()}
                </div>

                <div className="user-profile-hero-copy">
                    <h2>{name}</h2>
                    <p>{user?.email || "-"}</p>

                    <div className="user-profile-tags">
                        <span>🔐 {role}</span>
                        {user?.branch && <span>📍 {user.branch}</span>}
                    </div>
                </div>
            </section>

            <section className="user-profile-grid" aria-label="Account details">
                {profileItems.map((item) => (
                    <article className="user-profile-card" key={item.label}>
                        <h3>{item.label}</h3>
                        <p>
                            {item.style ? (
                                <span
                                    className={`user-profile-value-badge ${item.style}`}
                                >
                                    {item.value}
                                </span>
                            ) : (
                                item.value
                            )}
                        </p>
                    </article>
                ))}
            </section>
        </section>
    );
}
export default UserProfile;