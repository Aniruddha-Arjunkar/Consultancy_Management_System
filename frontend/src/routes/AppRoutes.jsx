import {
    Navigate,
    Route,
    Routes,
} from "react-router";

import Login from "../Views/Auth/Login/Login";

import DashboardLayout from "../Layout/DashboardLayout/DashboardLayout";

import Dashboard from "../Views/Dashboard/Dashboard";
import WelcomePage from "../Views/Dashboard/WelcomePage";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import PermissionRoute from "./PermissionRoute";

import { useAuth } from "../context/AuthContext";

function DashboardHome() {
    const { user } = useAuth();

    const isSuperAdmin =
        user?.role?.toUpperCase() === "SUPER_ADMIN";

    return isSuperAdmin
        ? <Dashboard />
        : <WelcomePage />;
}

function ChatPage() {
    return (
        <div style={{ padding: "24px" }}>
            <h2>Chat</h2>

            <p>
                Chat module will be implemented here.
            </p>
        </div>
    );
}

function ModulePlaceholder({ title }) {
    return (
        <div style={{ padding: "24px" }}>
            <h2>{title}</h2>

            <p>
                This module is ready for implementation.
            </p>
        </div>
    );
}

function NotFoundPage() {
    return (
        <div style={{ padding: "32px" }}>
            <h2>404 - Page Not Found</h2>

            <p>
                The page you requested does not exist.
            </p>
        </div>
    );
}

function AppRoutes() {
    return (
        <Routes>

            {/* Routes for users who are not logged in */}
            <Route element={<GuestRoute />}>
                <Route
                    path="/login"
                    element={<Login />}
                />
            </Route>

            {/* All authenticated routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>

                    {/* Dashboard */}
                    <Route
                        index
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                    <Route
                        path="dashboard"
                        element={<DashboardHome />}
                    />

                    {/* Chat: available to all authenticated users */}
                    <Route
                        path="chat"
                        element={<ChatPage />}
                    />

                    {/* Accounts */}
                    <Route element={
                        <PermissionRoute module="ACCOUNTS" />
                    }>
                        <Route
                            path="accounts/*"
                            element={
                                <ModulePlaceholder title="Accounts" />
                            }
                        />
                    </Route>

                    {/* Employee */}
                    <Route element={
                        <PermissionRoute module="EMPLOYEE" />
                    }>
                        <Route
                            path="employee/*"
                            element={
                                <ModulePlaceholder title="Employee" />
                            }
                        />
                    </Route>

                    {/* Attendance */}
                    <Route element={
                        <PermissionRoute module="ATTENDANCE" />
                    }>
                        <Route
                            path="attendance/*"
                            element={
                                <ModulePlaceholder title="Attendance" />
                            }
                        />
                    </Route>

                    {/* Consultancy */}
                    <Route element={
                        <PermissionRoute module="CONSULTANCY" />
                    }>
                        <Route
                            path="consultancy/*"
                            element={
                                <ModulePlaceholder title="Consultancy" />
                            }
                        />
                    </Route>

                    {/* Users: Super Admin only */}
                    <Route element={
                        <PermissionRoute module="USERS" />
                    }>
                        <Route
                            path="users/*"
                            element={
                                <ModulePlaceholder title="Users Management" />
                            }
                        />
                    </Route>
                    {/* Unknown authenticated routes */}
                    <Route
                        path="*"
                        element={<NotFoundPage />}
                    />
                </Route>
            </Route>
            {/* Unknown routes */}
            <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
            />
        </Routes>
    );
}
export default AppRoutes;