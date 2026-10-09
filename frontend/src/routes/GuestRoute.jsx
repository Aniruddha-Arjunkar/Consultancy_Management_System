import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

function GuestRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
export default GuestRoute;