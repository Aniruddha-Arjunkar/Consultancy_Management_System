// import { useState } from "react";

// import { useAuth } from "../../context/AuthContext";

// import SideBar from "../../Components/SideBar/SideBar";
// import TopBar from "../../Components/TopBar/TopBar";

// import Dashboard from "../../Views/Dashboard/Dashboard";
// import WelcomePage from "../../Views/Dashboard/WelcomePage";

// import "./DashboardLayout.css";


// function DashboardLayout() {

//     const { user } = useAuth();
//     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//     const [currentPage, setCurrentPage] = useState("dashboard");


//     const isSuperAdmin =
//         user?.role?.toUpperCase() === "SUPER_ADMIN";


//     const handleNavigate = (page) => {
//         setCurrentPage(page);
//     };


//     const renderPage = () => {
//         switch (currentPage) {
//             case "dashboard":

//                 if (isSuperAdmin) {
//                     return <Dashboard />;
//                 }

//                 return <WelcomePage />;


//             case "chat":

//                 return (
//                     <div style={{ padding: "24px" }}>
//                         <h2>Chat</h2>

//                         <p>
//                             Chat module will be implemented here.
//                         </p>
//                     </div>
//                 );


//             default:

//                 if (isSuperAdmin) {
//                     return <Dashboard />;
//                 }
//                 return <WelcomePage />;
//         }
//     };


//     return (
//         <div
//             className={
//                 `shul-app-layout ${
//                     sidebarCollapsed
//                         ? "sidebar-collapsed-state"
//                         : ""
//                 }`
//             }
//         >

//             <TopBar
//                 collapsed={sidebarCollapsed}
//                 onToggleSidebar={() =>
//                     setSidebarCollapsed(
//                         previous => !previous
//                     )
//                 }
//             />

//             <SideBar
//                 collapsed={sidebarCollapsed}
//                 onToggleSidebar={() => setSidebarCollapsed(previous => !previous)}
//                 currentPage={currentPage}
//                 onNavigate={handleNavigate}
//             />

//             <main className="shul-main-content">
//                 {renderPage()}
//             </main>
//         </div>
//     );
// }
// export default DashboardLayout;

import { useState } from "react";

import {
    Outlet,
    useNavigate,
} from "react-router";

import SideBar from "../../Components/SideBar/SideBar";
import TopBar from "../../Components/TopBar/TopBar";

import "./DashboardLayout.css";

function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState("dashboard");
    const navigate = useNavigate();

    const handleNavigate = (page) => {
        const routes = {
            dashboard: "/dashboard",
            chat: "/chat",
            accounts: "/accounts",
            employee: "/employee",
            attendance: "/attendance",
            consultancy: "/consultancy",
            users: "/users",
        };

        const destination = routes[page];

        if (destination) {
            navigate(destination);
        }
    };

    return (
        <div
            className={`shul-app-layout ${
                sidebarCollapsed
                    ? "sidebar-collapsed-state"
                    : ""
            }`}
        >
            <TopBar
                collapsed={sidebarCollapsed}
                onToggleSidebar={() =>
                    setSidebarCollapsed(
                        (previous) => !previous
                    )
                }
            />

            <SideBar
                collapsed={sidebarCollapsed}
                onNavigate={handleNavigate}
                onToggleSidebar={() => setSidebarCollapsed(previous => !previous)}
                currentPage={currentPage}
            />

            <main className="shul-main-content">
                <Outlet />
            </main>
        </div>
    );
}
export default DashboardLayout;