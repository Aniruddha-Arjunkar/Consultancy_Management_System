import { Navigate, Outlet } from "react-router";

import { useAuth } from "../context/AuthContext";

function PermissionRoute({ module }) {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const role = user.role?.toUpperCase();

    // Super Admin can access every module.
    if (role === "SUPER_ADMIN") {
        return <Outlet />;
    }

    const accessModules = user.accessModules;

    if (!accessModules) {
        return <AccessDenied />;
    }

    const modules = accessModules
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean);

    if (
        modules.includes("ALL") ||
        modules.includes(module.toUpperCase())
    ) {
        return <Outlet />;
    }

    return <AccessDenied />;
}

function AccessDenied() {
    return (
        <div style={{ padding: "32px" }}>
            <h2>Access Denied</h2>
            <p>
                You do not have permission to access this module.
                Please contact your administrator.
            </p>
        </div>
    );
}
export default PermissionRoute;