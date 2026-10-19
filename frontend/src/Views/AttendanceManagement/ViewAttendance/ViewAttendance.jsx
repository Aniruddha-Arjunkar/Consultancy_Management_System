import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import attendanceService from "../../../services/attendanceService";
import "./ViewAttendance.css";

const getCurrentMonth = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    return `${now.getFullYear()}-${month}`;
};

const getAttendanceClass = (code) => {
    switch (code) {
        case "P":
            return "attendance-present";
        case "A":
            return "attendance-absent";
        case "L":
            return "attendance-leave";
        case "HD":
            return "attendance-halfday";
        case "H":
            return "attendance-holiday";
        case "WO":
            return "attendance-weekoff";
        default:
            return "attendance-blank";
    }
};

const ViewAttendance = () => {
    const initialMonth = getCurrentMonth();

    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [reportMonth, setReportMonth] = useState(initialMonth);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isCurrentRequest = true;

        const loadReport = async () => {
            setLoading(true);

            try {
                const data =
                    await attendanceService.getMonthlyAttendance(reportMonth);

                if (isCurrentRequest) {
                    setReport(data);
                }
            } catch (error) {
                if (isCurrentRequest) {
                    setReport(null);
                    window.alert(
                        error.message || "Unable to load attendance."
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setLoading(false);
                }
            }
        };

        loadReport();

        return () => {
            isCurrentRequest = false;
        };
    }, [reportMonth]);

    const displayedMonth = report?.month || reportMonth;

    const daysInMonth = useMemo(() => {
        if (report?.daysInMonth) {
            return report.daysInMonth;
        }

        const [year, month] = displayedMonth.split("-").map(Number);
        return new Date(year, month, 0).getDate();
    }, [report?.daysInMonth, displayedMonth]);

    const days = useMemo(() => {
        const [year, month] = displayedMonth.split("-").map(Number);

        return Array.from({ length: daysInMonth }, (_, index) => {
            const dayNumber = index + 1;
            const date = new Date(year, month - 1, dayNumber);

            return {
                number: dayNumber,
                weekday: date
                    .toLocaleDateString("en-US", { weekday: "short" })
                    .toUpperCase(),
            };
        });
    }, [displayedMonth, daysInMonth]);

    const monthTitle = useMemo(() => {
        const [year, month] = displayedMonth.split("-").map(Number);

        return new Date(year, month - 1, 1)
            .toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            })
            .toUpperCase();
    }, [displayedMonth]);

    const employees = report?.employees || [];

    const handleMonthSubmit = (event) => {
        event.preventDefault();
        setReportMonth(selectedMonth);
    };

    return (
        <div className="attendance-page">
            <div className="attendance-card">
                <div className="attendance-header">
                    <div className="attendance-header-left">
                        <h1>View Employee Attendance</h1>
                        <div className="attendance-subtitle">
                            Monthly Attendance Report
                        </div>
                    </div>

                    <div className="attendance-record-count">
                        {employees.length} Records
                    </div>
                </div>

                <div className="attendance-content">
                    <div className="attendance-month-row">
                        <div className="attendance-month-label">
                            Select Month :
                        </div>

                        <form
                            className="attendance-month-form"
                            onSubmit={handleMonthSubmit}
                        >
                            <input
                                type="month"
                                name="selected_month"
                                value={selectedMonth}
                                onChange={(event) =>
                                    setSelectedMonth(event.target.value)
                                }
                                className="attendance-month-input"
                                required
                            />

                            <button type="submit">View</button>
                        </form>
                    </div>

                    <div className="attendance-month-title">
                        Attendance Of : <span style={{fontSize:"20px"}}>{monthTitle}</span>
                    </div>

                    <div className="attendance-legend">
                        <span className="attendance-legend-title">
                            Legend :
                        </span>

                        <span className="legend-box legend-present">P</span>
                        <span>Present</span>

                        <span className="legend-box legend-absent">A</span>
                        <span>Absent</span>

                        <span className="legend-box legend-leave">L</span>
                        <span>Leave</span>

                        <span className="legend-box legend-halfday">HD</span>
                        <span>Half Day</span>

                        <span className="legend-box legend-holiday">H</span>
                        <span>Holiday</span>

                        <span className="legend-box legend-weekoff">WO</span>
                        <span>Week Off</span>
                    </div>

                    <div className="attendance-table-wrapper">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th rowSpan="2">NO</th>
                                    <th rowSpan="2">NAME</th>

                                    {days.map((day) => (
                                        <th key={day.number}>{day.number}</th>
                                    ))}
                                </tr>

                                <tr>
                                    {days.map((day) => (
                                        <th key={day.number}>{day.weekday}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={daysInMonth + 2}
                                            className="no-attendance"
                                        >
                                            Loading attendance...
                                        </td>
                                    </tr>
                                ) : employees.length > 0 ? (
                                    employees.map((employee, index) => (
                                        <tr key={employee.employeeId}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="employee-name">
                                                    {employee.employeeName}
                                                </span>

                                                {employee.branch && (
                                                    <span className="employee-branch">
                                                        {employee.branch}
                                                    </span>
                                                )}

                                                <Link
                                                    to={`/attendance/view-employee-attendance/${employee.employeeId}?month=${encodeURIComponent(displayedMonth)}`}
                                                    className="employee-view-btn"
                                                >
                                                    View
                                                </Link>
                                            </td>

                                            {days.map((day) => {
                                                const code =
                                                    employee.attendanceByDay?.[
                                                        day.number
                                                    ] || "";

                                                return (
                                                    <td
                                                        key={day.number}
                                                        className={getAttendanceClass(
                                                            code
                                                        )}
                                                    >
                                                        {code}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={daysInMonth + 2}
                                            className="no-attendance"
                                        >
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ViewAttendance;