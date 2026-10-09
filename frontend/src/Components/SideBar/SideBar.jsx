import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import "./SideBar.css";

function SideBar({
    collapsed,
    onToggleSidebar,
    onNavigate,
    currentPage
}) {

    const { user, logout } = useAuth();


    const [openMenus, setOpenMenus] = useState({
        accounts: true,
        payments: false,
        gstBills: false,
        expenses: false,
        advance: false,
        tds: false,

        employee: true,
        employeePages: false,
        salary: false,

        attendance: true,

        consultancy: true,
        associate: false,
        requirement: false,
        registration: false,
        interview: false,
        studentStatus: false
    });


    const toggleMenu = (menu) => {

        setOpenMenus((previous) => ({
            ...previous,
            [menu]: !previous[menu]
        }));
    };


    /*
     * Frontend permission helper.
     *
     * Backend remains the real security layer.
     */
    const hasModule = (module) => {

        if (!user) {
            return false;
        }

        if (user.role === "SUPER_ADMIN") {
            return true;
        }

        if (!user.accessModules) {
            return false;
        }

        if (user.accessModules === "ALL") {
            return true;
        }

        const modules = user.accessModules
            .split(",")
            .map((item) => item.trim().toUpperCase());

        return modules.includes(module);
    };


    // const showDashboard =
    //     user?.role === "SUPER_ADMIN";
    const showDashboard = !!user;

    const showAccounts =
        hasModule("ACCOUNTS");

    const showEmployee =
        hasModule("EMPLOYEE");

    const showAttendance =
        hasModule("ATTENDANCE");

    const showConsultancy =
        hasModule("CONSULTANCY");

    const showUsers =
        user?.role === "SUPER_ADMIN";


    const navigate = (page) => {
        onNavigate(page);
    };


    const handleLogout = async () => {

        try {

            await logout();

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );

        }
    };


    return (
        <aside
            className={`shul-sidebar-scroll ${collapsed ? "collapsed" : ""
                }`}
        >

            {/* =================================================
                SIDEBAR HEADER
            ================================================== */}

            <div className="shul-sidebar-header">
                <div className="shul-sidebar-brand">
                    <img src={logo} alt="SHUL" />

                    {!collapsed && (
                        <div className="shul-sidebar-brand-text">
                            <div className="shul-sidebar-brand-title">
                                SHUL
                            </div>
                            <div className="shul-sidebar-brand-sub">
                                Ventures Pvt. Ltd.
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="shul-sidebar-toggle"
                    title="Toggle Sidebar"
                    onClick={onToggleSidebar}>
                    {collapsed ? "»" : "«"}
                </button>
            </div>


            {/* =================================================
                SIDEBAR NAVIGATION
            ================================================== */}
            <div className="php-sidebar-navigation">
                <ul className="sidebar-menu">


                    {/* =================================================
                        DASHBOARD
                    ================================================== */}

                    {showDashboard && (

                        <li>

                            <a href="#"
                                className={
                                    currentPage === "dashboard"
                                        ? "active"
                                        : ""
                                }
                                onClick={(event) => {
                                    event.preventDefault();
                                    navigate("dashboard");
                                }}>

                                <span className="menu-icon">
                                    🏠
                                </span>

                                {!collapsed && (
                                    <span>
                                        Dashboard
                                    </span>
                                )}
                            </a>
                        </li>
                    )}

                    {/* =================================================
                        CHAT
                    ================================================== */}
                    <li>
                        <a href="#"
                            className={
                                currentPage === "chat"
                                    ? "active"
                                    : ""
                            }
                            onClick={(event) => {
                                event.preventDefault();
                                navigate("chat");
                            }}
                        >

                            <span className="menu-icon">
                                💬
                            </span>

                            {!collapsed && (
                                <span>
                                    Chat
                                </span>
                            )}
                        </a>
                    </li>


                    {/* =================================================
                        MODULE LABEL
                    ================================================== */}

                    {!collapsed && (
                        <li className="sidebar-section-label">
                            MODULES
                        </li>
                    )}


                    {/* =================================================
                        ACCOUNTS MANAGEMENT
                    ================================================== */}

                    {showAccounts && (

                        <li
                            className={`sub-menu ${openMenus.accounts
                                    ? "open"
                                    : ""
                                }`}>

                            <a href="#"
                                onClick={(event) => {
                                    event.preventDefault();
                                    toggleMenu("accounts");
                                }}>

                                <span className="menu-icon">
                                    💳
                                </span>

                                {!collapsed && (
                                    <>
                                        <span>
                                            Accounts
                                        </span>

                                        <span className="menu-arrow">
                                            ⌄
                                        </span>
                                    </>)}
                            </a>


                            {!collapsed &&
                                openMenus.accounts && (

                                    <ul className="sub">


                                        {/* PAYMENTS */}

                                        <li
                                            className={`sub-menu ${openMenus.payments
                                                    ? "open"
                                                    : ""
                                                }`}>
                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("payments");
                                                }}>

                                                <span className="menu-icon">
                                                    💰
                                                </span>
                                                <span>
                                                    Payments
                                                </span>
                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>

                                            {openMenus.payments && (

                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("due-payment");
                                                            }}>
                                                            › Due Payment
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("view-payments");
                                                            }}>
                                                            › View Payments
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("defaulter-payment");
                                                            }}>
                                                            › Defaulter Payment
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>


                                        {/* GST BILLS */}

                                        <li
                                            className={`sub-menu ${openMenus.gstBills
                                                    ? "open"
                                                    : ""
                                                }`}
                                        >

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("gstBills");
                                                }}>

                                                <span className="menu-icon">
                                                    🧾
                                                </span>

                                                <span>
                                                    GST Bills
                                                </span>

                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>


                                            {openMenus.gstBills && (

                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("generate-invoice");
                                                            }}>
                                                            › Generate Invoice
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("gst-invoice");
                                                            }}>
                                                            › GST Invoice
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>


                                        {/* EXPENSES */}

                                        <li
                                            className={`sub-menu ${openMenus.expenses
                                                    ? "open"
                                                    : ""
                                                }`}
                                        >

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("expenses");
                                                }}>

                                                <span className="menu-icon">
                                                    💸
                                                </span>

                                                <span>
                                                    Expenses
                                                </span>

                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>

                                            </a>


                                            {openMenus.expenses && (

                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a
                                                            href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("add-expenses");
                                                            }}>
                                                            › Add Expenses
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("view-expenses");
                                                            }}
                                                        >
                                                            › View Expenses
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>


                                        {/* ADVANCE */}

                                        <li
                                            className={`sub-menu ${openMenus.advance
                                                    ? "open"
                                                    : ""
                                                }`}
                                        >

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("advance");

                                                }}>

                                                <span className="menu-icon">
                                                    💵
                                                </span>

                                                <span>
                                                    Advance
                                                </span>

                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>
                                            {openMenus.advance && (

                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("add-advance");
                                                            }}>
                                                            › Add Advance
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("view-advance");
                                                            }}>
                                                            › View Advance
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>


                                        {/* TDS */}

                                        <li
                                            className={`sub-menu ${openMenus.tds
                                                    ? "open"
                                                    : ""
                                                }`}
                                        >

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("tds");
                                                }}>

                                                <span className="menu-icon">
                                                    🧮
                                                </span>
                                                <span>
                                                    TDS
                                                </span>
                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>

                                            {openMenus.tds && (

                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("due-tds");

                                                            }}
                                                        >
                                                            › Due TDS
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("paid-tds");
                                                            }}>
                                                            › Paid TDS
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>
                                    </ul>
                                )}
                        </li>
                    )}


                    {/* =================================================
                        EMPLOYEE MANAGEMENT
                    ================================================== */}

                    {showEmployee && (

                        <li
                            className={`sub-menu ${openMenus.employee
                                    ? "open"
                                    : ""
                                }`}>

                            <a href="#"
                                onClick={(event) => {
                                    event.preventDefault();
                                    toggleMenu("employee");
                                }}>

                                <span className="menu-icon">
                                    👥
                                </span>

                                {!collapsed && (
                                    <>
                                        <span>
                                            Employee Management
                                        </span>
                                        <span className="menu-arrow">
                                            ⌄
                                        </span>
                                    </>
                                )}
                            </a>


                            {!collapsed &&
                                openMenus.employee && (

                                    <ul className="sub">


                                        {/* EMPLOYEE */}

                                        <li
                                            className={`sub-menu ${openMenus.employeePages
                                                    ? "open"
                                                    : ""
                                                }`}>

                                            <a
                                                href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("employeePages");

                                                }}>

                                                <span className="menu-icon">
                                                    👤
                                                </span>

                                                <span>
                                                    Employee
                                                </span>

                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>

                                            {openMenus.employeePages && (

                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("add-employee");
                                                            }}>
                                                            › Add Employee
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("view-employee");
                                                            }}>
                                                            › View Employee
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("generate-letter");
                                                            }}>
                                                            › Generate Letter
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>


                                        {/* SALARY */}

                                        <li
                                            className={`sub-menu ${openMenus.salary
                                                    ? "open"
                                                    : ""
                                                }`}>

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("salary");

                                                }}>

                                                <span className="menu-icon">
                                                    💰
                                                </span>

                                                <span>
                                                    Salary
                                                </span>

                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>


                                            {openMenus.salary && (

                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("add-salary");
                                                            }}>
                                                            › Add Salary
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>
                                    </ul>
                                )}
                        </li>
                    )}


                    {/* =================================================
                        ATTENDANCE MANAGEMENT
                    ================================================== */}

                    {showAttendance && (

                        <li
                            className={`sub-menu ${openMenus.attendance
                                    ? "open"
                                    : ""
                                }`}
                        >

                            <a href="#"
                                onClick={(event) => {
                                    event.preventDefault();
                                    toggleMenu("attendance");
                                }}>

                                <span className="menu-icon">
                                    📅
                                </span>

                                {!collapsed && (
                                    <>
                                        <span>
                                            Attendance Management
                                        </span>

                                        <span className="menu-arrow">
                                            ⌄
                                        </span>
                                    </>
                                )}
                            </a>


                            {!collapsed &&
                                openMenus.attendance && (

                                    <ul className="sub">

                                        <li>
                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    navigate("add-attendance");
                                                }}>
                                                <span className="menu-icon">
                                                    ➕
                                                </span>
                                                Add Attendance
                                            </a>
                                        </li>

                                        <li>
                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    navigate("view-attendance");

                                                }}>
                                                <span className="menu-icon">
                                                    📋
                                                </span>
                                                View Attendance
                                            </a>
                                        </li>
                                    </ul>
                                )}
                        </li>
                    )}


                    {/* =================================================
                        CONSULTANCY MANAGEMENT
                    ================================================== */}

                    {showConsultancy && (

                        <li
                            className={`sub-menu ${openMenus.consultancy
                                    ? "open"
                                    : ""
                                }`}>

                            <a href="#"
                                onClick={(event) => {
                                    event.preventDefault();
                                    toggleMenu("consultancy");

                                }}>

                                <span className="menu-icon">
                                    💼
                                </span>

                                {!collapsed && (
                                    <>
                                        <span>
                                            Consultancy Management
                                        </span>
                                        <span className="menu-arrow">
                                            ⌄
                                        </span>
                                    </>
                                )}
                            </a>


                            {!collapsed &&
                                openMenus.consultancy && (
                                    <ul className="sub">

                                        {/* ASSOCIATE COMPANIES */}

                                        <li
                                            className={`sub-menu ${openMenus.associate
                                                    ? "open"
                                                    : ""
                                                }`}>

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("associate");

                                                }}>

                                                <span className="menu-icon">
                                                    🏢
                                                </span>

                                                <span>
                                                    Associate Companies
                                                </span>

                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>

                                            {openMenus.associate && (
                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("add-associate");
                                                            }}>
                                                            › Add Associate
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("view-associate");

                                                            }}>
                                                            › View Associate
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>


                                        {/* CURRENT REQUIREMENT */}

                                        <li
                                            className={`sub-menu ${openMenus.requirement
                                                    ? "open"
                                                    : ""
                                                }`}>

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("requirement");
                                                }}>

                                                <span className="menu-icon">
                                                    📋
                                                </span>
                                                <span>
                                                    Current Requirement
                                                </span>
                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>

                                            {openMenus.requirement && (

                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("add-requirement");

                                                            }}>
                                                            › Add Current Requirement
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a
                                                            href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("view-requirement");
                                                            }}>
                                                            › View Requirement
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("closed-requirement");
                                                            }}>
                                                            › Closed
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>


                                        {/* REGISTRATION */}

                                        <li
                                            className={`sub-menu ${openMenus.registration
                                                    ? "open"
                                                    : ""
                                                }`}>

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("registration");
                                                }}>
                                                <span className="menu-icon">
                                                    📝
                                                </span>
                                                <span>
                                                    Registration
                                                </span>
                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>

                                            {openMenus.registration && (
                                                <ul className="sub nested-sub">
                                                    <li>
                                                        <a
                                                            href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("add-student");

                                                            }}>
                                                            › Add Student
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("view-student");

                                                            }}>
                                                            › View Student
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>


                                        {/* ALL CANDIDATES */}

                                        <li>

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    navigate("all-candidates");
                                                }}>
                                                <span className="menu-icon">
                                                    👨‍💼
                                                </span>
                                                All Candidates
                                            </a>
                                        </li>


                                        {/* INTERVIEW STATUS */}

                                        <li
                                            className={`sub-menu ${openMenus.interview
                                                    ? "open"
                                                    : ""
                                                }`}>

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("interview");

                                                }}>

                                                <span className="menu-icon">
                                                    📅
                                                </span>
                                                <span>
                                                    Interview Status
                                                </span>
                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>

                                            {openMenus.interview && (

                                                <ul className="sub nested-sub">

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("interview-scheduled");
                                                            }}>
                                                            › Interview Scheduled
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>


                                        {/* STUDENT STATUS */}

                                        <li
                                            className={`sub-menu ${openMenus.studentStatus
                                                    ? "open"
                                                    : ""
                                                }`}>

                                            <a href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    toggleMenu("studentStatus");

                                                }}>
                                                <span className="menu-icon">
                                                    🎓
                                                </span>
                                                <span>
                                                    Student Status
                                                </span>
                                                <span className="menu-arrow">
                                                    ⌄
                                                </span>
                                            </a>


                                            {openMenus.studentStatus && (
                                                <ul className="sub nested-sub">
                                                    <li>
                                                        <a
                                                            href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate("placed-candidates");
                                                            }}
                                                        >
                                                            › Placed Candidates
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                navigate(
                                                                    "rejected-candidates"
                                                                );

                                                            }}>
                                                            › Rejected Candidates
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>
                                    </ul>
                                )}
                        </li>
                    )}


                    {/* ======== USERS ========= */}
                    {showUsers && (
                        <li>
                            <a
                                href="#"
                                className={
                                    currentPage === "users"
                                        ? "active"
                                        : ""
                                }
                                onClick={(event) => {

                                    event.preventDefault();

                                    navigate("users");
                                }}>
                                <span className="menu-icon">
                                    👤
                                </span>
                                {!collapsed && (
                                    <span>
                                        Users
                                    </span>
                                )}
                            </a>
                        </li>
                    )}

                    {/* =========== LOGOUT ======= */}

                    <li className="sidebar-logout-item">

                        <a
                            href="#"
                            onClick={(event) => {
                                event.preventDefault();
                                handleLogout();
                            }}>

                            <span className="menu-icon">
                                ↪
                            </span>
                            {!collapsed && (
                                <span>
                                    Logout
                                </span>
                            )}
                        </a>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
export default SideBar;