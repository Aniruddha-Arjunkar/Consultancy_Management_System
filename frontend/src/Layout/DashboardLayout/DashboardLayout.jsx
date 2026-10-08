import { useState } from "react";
import SideBar from "../../Components/SideBar/SideBar";
import TopBar from "../../Components/TopBar/TopBar";
import Dashboard from "../../Views/Dashboard/Dashboard";
import "./DashboardLayout.css";


function DashboardLayout() {

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState("dashboard");


    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case "dashboard":
                return <Dashboard />;


            /*
             * Pages will be added here later.
             * Example:
             *
             * case "users":
             *     return <Users />;
             * case "add-employee":
             *     return <AddEmployee />;
             */
            
            default:
                return <Dashboard />;
        }
    };

    return (
        <div
            className={
                `shul-app-layout ${
                    sidebarCollapsed
                        ? "sidebar-collapsed-state"
                        : ""
                }`}>

            <SideBar
                collapsed={sidebarCollapsed}
                onToggleSidebar={() => setSidebarCollapsed(previous => !previous)}
                onNavigate={handleNavigate}
                currentPage={currentPage}
            />

            <TopBar />

            <main className="shul-main-content">
                {renderPage()}
            </main>
        </div>
    );
}
export default DashboardLayout;