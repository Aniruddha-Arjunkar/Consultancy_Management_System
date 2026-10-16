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

//=============== Chat ==========================
import Chat from "./../Views/Chat/Chat.jsx"

//=============== User Management ===============
import User from "./../Views/UserManagement/User.jsx";

//============= Employee Management ===========
import AddEmployee from "./../Views/EmployeeManagement/AddEmployee/AddEmployee.jsx";
import ViewEmployee from "./../Views/EmployeeManagement/ViewEmployee/ViewEmployee.jsx";
import Salary from "./../Views/EmployeeManagement/Salary/Salary.jsx";
import GenerateLetter from "./../Views/EmployeeManagement/GenerateLetter/GenerateLetter.jsx";
import ViewAllEmployee from "./../Views/EmployeeManagement/ViewEmployee/ViewAllEmployee.jsx";
import ViewExitEmployee from "./../Views/EmployeeManagement/ViewEmployee/ExitEmployee.jsx";
import ViewAbscondEmployee from "./../Views/EmployeeManagement/ViewEmployee/AbscondEmployee.jsx";
import ViewEmployeeDetail from "./../Views/EmployeeManagement/ViewEmployee/ViewEmployeeDetail.jsx";
import UploadEmployeeDocument from "./../Views/EmployeeManagement/ViewEmployee/UploadEmployeeDocument.jsx";
import UpdateEmplpoyee from "./../Views/EmployeeManagement/ViewEmployee/UpdateEmployee.jsx";



//============== Attendance Management ==================
import AddAttendance from "./../Views/AttendanceManagement/AddAttendance/AddAttendance.jsx";
import ViewAttendance from "./../Views/AttendanceManagement/ViewAttendance/ViewAttendance.jsx";

//============= Acounts Managements ===================
import DuePayments from "./../Views/AccountsManagement/Payments/DuePayments/DuePayment.jsx";
import ViewPayments from "./../Views/AccountsManagement/Payments/ViewPayments/ViewPayment.jsx";
import DefaulterPayments from "./../Views/AccountsManagement/Payments/DefaulterPayments/DefaulterPayments.jsx";
import GenerateInvoice from "./../Views/AccountsManagement/GSTBills/GenerateInvoice/GenerateInvoice.jsx";
import GSTInvoices from "./../Views/AccountsManagement/GSTBills/GSTInvoices/GSTInvoices.jsx";
import AddExpenses from "./../Views/AccountsManagement/Expenses/AddExpenses/AddExpenses.jsx";
import ViewExpenses from "./../Views/AccountsManagement/Expenses/ViewExpenses/ViewExpenses.jsx";
import AddAdvance from "./../Views/AccountsManagement/Advance/AddAdvance/AddAdvance.jsx";
import ViewAdvance from "./../Views/AccountsManagement/Advance/ViewAdvance/ViewAdvance.jsx";
import DueTDS from "./../Views/AccountsManagement/TDS/DueTDS/DueTDS.jsx";
import PaidTDS from "./../Views/AccountsManagement/TDS/PaidTDS/PaidTDS.jsx";


//============ Consultancy Management =====================
import AddAssociateCompany from "./../Views/ConsultancyManagement/AssociateCompanies/AddAssociateCompany/AddAssociateCompany.jsx";
import ViewAssociateCompany from "./../Views/ConsultancyManagement/AssociateCompanies/ViewAssociateCompany/ViewAssociateCompany.jsx";
import AddCurrentRequirement from "./../Views/ConsultancyManagement/CurrentRequirement/AddCurrentRequirement/AddCurrentRequirement.jsx";
import ViewRequirement from "./../Views/ConsultancyManagement/CurrentRequirement/ViewRequirements/ViewRequirements.jsx";
import ClosedRequirements from "./../Views/ConsultancyManagement/CurrentRequirement/Closed/Close.jsx";
import AddStudent from "./../Views/ConsultancyManagement/Registration/AddStudent/AddStudent.jsx";
import ViewStudent from "./../Views/ConsultancyManagement/Registration/ViewStudent/ViewStudent.jsx";
import AllCandidates from "./../Views/ConsultancyManagement/AllCandidates/AllCandidates.jsx";
import InterviewScheduled from "./../Views/ConsultancyManagement/InterviewStatus/InterviewScheduled/InterviewScheduled.jsx";
import PlacedCandidates from "./../Views/ConsultancyManagement/StudentStatus/PlacedCandidates/PlacedCandidates.jsx";
import RejectedCandidates from "./../Views/ConsultancyManagement/StudentStatus/RejectedCandidates/RejectedCandidates.jsx";

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

                    <Route path="dashboard" element={<DashboardHome />} />

                    {/* Chat: available to all authenticated users */}
                    <Route path="chat" element={<Chat />} />

    
                    {/* Accounts */}
                    <Route element={<PermissionRoute module="ACCOUNTS" page="PAYMENTS_DUE" />}>
                        <Route path="accounts/due-payment" element={<DuePayments />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="PAYMENTS_VIEW" />}>
                        <Route path="accounts/view-payment" element={<ViewPayments />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="PAYMENTS_DEFAULTER" />}>
                        <Route path="accounts/payment-defaulter" element={<DefaulterPayments />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="GST_GENERATE" />}>
                        <Route path="accounts/generate-invoice" element={<GenerateInvoice />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="GST_VIEW" />}>
                        <Route path="accounts/gst-Invoice" element={<GSTInvoices />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="EXPENSES_ADD" />}>
                        <Route path="accounts/add-expenses" element={<AddExpenses />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="EXPENSES_VIEW" />}>
                        <Route path="accounts/view-expenses" element={<ViewExpenses />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="ADVANCE_ADD" />}>
                        <Route path="accounts/add-advance" element={<AddAdvance />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="ADVANCE_VIEW" />}>
                        <Route path="accounts/view-advance" element={<ViewAdvance />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="TDS_DUE" />}>
                        <Route path="accounts/due-tds" element={<DueTDS />} />
                    </Route>

                    <Route element={<PermissionRoute module="ACCOUNTS" page="TDS_PAID" />}>
                        <Route path="accounts/paid-tds" element={<PaidTDS />} />
                    </Route>


                    {/* Employee */}
                    <Route element={<PermissionRoute module="EMPLOYEE" page="ADD" />}>
                        <Route path="employee/add-employee" element={<AddEmployee />} />
                    </Route>

                    <Route element={<PermissionRoute module="EMPLOYEE" page="VIEW" />}>
                        <Route path="employee/view-employee" element={<ViewEmployee />} />
                        <Route path="employee/view-all-employee" element={<ViewAllEmployee />} />
                        <Route path="employee/exit-employee" element={<ViewExitEmployee />} />
                        <Route path="employee/abscond-employee" element={<ViewAbscondEmployee />} />
                        <Route path="employee/view-employee-detail/:employeeId" element={<ViewEmployeeDetail />} />
                        <Route path="employee/:employeeId/upload-document" element={<UploadEmployeeDocument />} />
                        <Route path="employee/:employeeId/update-employee" element={<UpdateEmplpoyee />} />
                    </Route>

                    <Route element={<PermissionRoute module="EMPLOYEE" page="GENERATE_LETTER" />}>
                        <Route path="employee/generate-letter" element={<GenerateLetter />} />
                    </Route>

                    <Route element={<PermissionRoute module="EMPLOYEE" page="ADD_SALARY" />}>
                        <Route path="employee/salary" element={<Salary />} />
                    </Route>

                    {/* Attendance */}
                    <Route element={<PermissionRoute module="ATTENDANCE" page="ADD" />}>
                        <Route path="attendance/add-attendance" element={<AddAttendance />} />
                    </Route>

                    <Route element={<PermissionRoute module="ATTENDANCE" page="VIEW" />}>
                        <Route path="attendance/view-attendance" element={<ViewAttendance />} />
                    </Route>

                    {/* Consultancy */}
                    <Route element={<PermissionRoute module="CONSULTANCY" page="ASSOCIATE_COMPANY_ADD" />}>
                        <Route path="consultancy/add-associate-company" element={<AddAssociateCompany />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="ASSOCIATE_COMPANY_VIEW" />}>
                        <Route path="consultancy/view-associate-company" element={<ViewAssociateCompany />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="REQUIREMENT_ADD" />}>
                        <Route path="consultancy/add-current-requirement" element={<AddCurrentRequirement />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="REQUIREMENT_VIEW" />}>
                        <Route path="consultancy/view-requirement" element={<ViewRequirement />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="REQUIREMENT_CLOSED" />}>
                        <Route path="consultancy/closed-requirement" element={<ClosedRequirements />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="STUDENT_ADD" />}>
                        <Route path="consultancy/add-students" element={<AddStudent />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="STUDENT_VIEW" />}>
                        <Route path="consultancy/viewStudents" element={<ViewStudent />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="CANDIDATES_VIEW" />}>
                        <Route path="consultancy/all-candidates" element={<AllCandidates />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="INTERVIEW_SCHEDULE" />}>
                        <Route path="consultancy/interview-schedule" element={<InterviewScheduled />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="PLACED_CANDIDATES" />}>
                        <Route path="consultancy/placed-candidates" element={<PlacedCandidates />} />
                    </Route>

                    <Route element={<PermissionRoute module="CONSULTANCY" page="REJECTED_CANDIDATES" />}>
                        <Route path="consultancy/rejected-candidates" element={<RejectedCandidates />} />
                    </Route>

                    {/* Users: Super Admin only */}
                    <Route element={<PermissionRoute module="USERS" />}>
                        <Route path="users" element={<User />} />
                    </Route>

                    {/* Unknown authenticated routes */}
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Route>
            {/* Unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
export default AppRoutes;