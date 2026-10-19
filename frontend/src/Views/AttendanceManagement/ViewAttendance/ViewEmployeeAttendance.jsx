import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import attendanceService from "../../../services/attendanceService";
import "./ViewEmployeeAttendance.css";

const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}`;
};

const getMonthDate = (month) => {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Date(year, monthNumber - 1, 1);
};

const formatMonth = (month) => {
    return getMonthDate(month).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
};

const getPreviousOrNextMonth = (month, offset) => {
    const date = getMonthDate(month);
    date.setMonth(date.getMonth() + offset);

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`;
};

const attendanceStatuses = {
    P: { label: "Present", className: "green" },
    A: { label: "Absent", className: "red" },
    L: { label: "Leave", className: "orange" },
    HD: { label: "Half Day", className: "skyblue" },
    H: { label: "Holiday", className: "purple" },
    WO: { label: "Week Off", className: "weekoff" },
};

const ViewEmployeeAttendance = () => {
    const { employeeId } = useParams();
    const [searchParams] = useSearchParams();

    const initialMonth = searchParams.get("month") || getCurrentMonth();

    const [month, setMonth] = useState(initialMonth);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isCurrentRequest = true;

        const loadAttendance = async () => {
            setLoading(true);

            try {
                const data =
                    await attendanceService.getEmployeeMonthlyAttendance(
                        employeeId,
                        month
                    );

                if (isCurrentRequest) {
                    setEmployee(data);
                }
            } catch (error) {
                if (isCurrentRequest) {
                    setEmployee(null);
                    window.alert(
                        error.message ||
                        "Unable to load this employee's attendance."
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setLoading(false);
                }
            }
        };

        loadAttendance();

        return () => {
            isCurrentRequest = false;
        };
    }, [employeeId, month]);

    const calendarWeeks = useMemo(() => {
        const firstDay = getMonthDate(month);
        const year = firstDay.getFullYear();
        const monthIndex = firstDay.getMonth();
        const numberOfDays = new Date(year, monthIndex + 1, 0).getDate();

        const cells = Array(firstDay.getDay()).fill(null);

        for (let day = 1; day <= numberOfDays; day++) {
            cells.push(day);
        }

        while (cells.length % 7 !== 0) {
            cells.push(null);
        }

        const weeks = [];

        for (let index = 0; index < cells.length; index += 7) {
            weeks.push(cells.slice(index, index + 7));
        }

        return weeks;
    }, [month]);

    const summary = useMemo(() => {
        const counts = {
            P: 0,
            A: 0,
            L: 0,
            HD: 0,
            H: 0,
            WO: 0,
        };

        Object.values(employee?.attendanceByDay || {}).forEach((code) => {
            if (Object.hasOwn(counts, code)) {
                counts[code]++;
            }
        });

        return counts;
    }, [employee]);

    const changeMonth = (offset) => {
        setMonth((currentMonth) =>
            getPreviousOrNextMonth(currentMonth, offset)
        );
    };

    const today = new Date();
    const isCurrentMonth =
        today.getFullYear() === getMonthDate(month).getFullYear() &&
        today.getMonth() === getMonthDate(month).getMonth();

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="panel panel-default">
                    <div className="panel-heading" style={{fontSize:'25px'}}>View Attendance</div>

                    <div className="container">
                        {loading ? (
                            <h2>Loading attendance...</h2>
                        ) : employee ? (
                            <>
                                <h2 style={{fontSize:'20px' , fontWeight:'600'}}>
                                    Attendance for{" "}
                                    <u style={{fontSize:'20px'}}>{employee.employeeName}</u>
                                </h2>

                                <div className="summary-box">
                                    <span className="green">
                                        Present: <span>{summary.P}</span>
                                    </span>

                                    <span className="red">
                                        Absent: <span>{summary.A}</span>
                                    </span>

                                    <span className="orange">
                                        Leave: <span>{summary.L}</span>
                                    </span>

                                    <span className="skyblue">
                                        Half Day: <span>{summary.HD}</span>
                                    </span>

                                    <span className="purple">
                                        Holiday: <span>{summary.H}</span>
                                    </span>
                                </div>

                                <div id="mini-calendar">
                                    <div className="fc-toolbar">
                                        <button
                                            type="button"
                                            className="fc-button"
                                            onClick={() => changeMonth(-1)}
                                            aria-label="Previous month"
                                        >
                                            <span className="fc-icon">
                                                ‹
                                            </span>
                                        </button>

                                        <h3>{formatMonth(month)}</h3>

                                        <button
                                            type="button"
                                            className="fc-button"
                                            onClick={() => changeMonth(1)}
                                            aria-label="Next month"
                                        >
                                            <span className="fc-icon">
                                                ›
                                            </span>
                                        </button>
                                    </div>

                                    <table className="fc-calendar">
                                        <thead>
                                            <tr>
                                                {[
                                                    "Sun",
                                                    "Mon",
                                                    "Tue",
                                                    "Wed",
                                                    "Thu",
                                                    "Fri",
                                                    "Sat",
                                                ].map((day) => (
                                                    <th
                                                        className="fc-day-header"
                                                        key={day}
                                                    >
                                                        {day}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {calendarWeeks.map(
                                                (week, weekIndex) => (
                                                    <tr key={weekIndex}>
                                                        {week.map(
                                                            (day, dayIndex) => {
                                                                if (day === null) {
                                                                    return (
                                                                        <td
                                                                            className="fc-day fc-other-month"
                                                                            key={dayIndex}
                                                                        />
                                                                    );
                                                                }

                                                                const code =
                                                                    employee
                                                                        .attendanceByDay?.[
                                                                    day
                                                                    ] || "";

                                                                const status =
                                                                    attendanceStatuses[
                                                                    code
                                                                    ];

                                                                const isToday =
                                                                    isCurrentMonth &&
                                                                    today.getDate() ===
                                                                    day;

                                                                return (
                                                                    <td
                                                                        className={`fc-day ${isToday
                                                                                ? "fc-today"
                                                                                : ""
                                                                            }`}
                                                                        key={dayIndex}
                                                                    >
                                                                        <span className="fc-day-number">
                                                                            {day}
                                                                        </span>

                                                                        {status && (
                                                                            <div
                                                                                className={`fc-event ${status.className}`}
                                                                                title={
                                                                                    status.label
                                                                                }
                                                                            >
                                                                                {
                                                                                    status.label
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            }
                                                        )}
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <h2>Employee attendance could not be found.</h2>
                        )}

                        <div className="back-btn">
                            <Link
                                to="/attendance/view-attendance"
                                className="btn btn-default"
                            >
                                ← Back
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default ViewEmployeeAttendance;