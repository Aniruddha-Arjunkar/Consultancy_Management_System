import { useEffect, useState } from "react";
import "./AddAttendance.css";
import attendanceService from "../../../services/attendanceService";

const STATUSES = [
    { label: "Present", value: "P" },
    { label: "Absent", value: "A" },
    { label: "Leave", value: "L" },
    { label: "Holiday", value: "H" },
    { label: "Half Day", value: "HD" },
    { label: "Week Off", value: "WO" },
];

const AddAttendance = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [attendanceByEmployee, setAttendanceByEmployee] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;

        attendanceService
            .getAttendanceEmployees()
            .then((data) => {
                if (isMounted) {
                    setEmployees(Array.isArray(data) ? data : []);
                }
            })
            .catch((requestError) => {
                if (isMounted) {
                    window.alert(requestError.message || "Could not load employees ❌ .");
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleStatusChange = (employeeId, status) => {
        setAttendanceByEmployee((previous) => ({
            ...previous,
            [employeeId]:
                previous[employeeId] === status ? "" : status,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const records = Object.entries(attendanceByEmployee)
            .filter(([, status]) => status)
            .map(([employeeId, status]) => ({
                employeeId: Number(employeeId),
                status,
            }));

        if (records.length === 0) {
            window.alert("Select an attendance status for at least one employee ❌ .");
            return;
        }

        setSaving(true);

        try {
            const result = await attendanceService.saveAttendance({
                date: selectedDate || null,
                records,
            });

            window.alert("Attendance recorded successfully ✅.")
            setAttendanceByEmployee({});
        } catch (requestError) {
            window.alert(requestError.message || "Could not save attendance ❌.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        Employee Attendance
                    </div>

                    <div className="panel-body">

                        <form onSubmit={handleSubmit}>
                            <table
                                className="table-responsive"
                                border="1"
                                cellSpacing="0"
                            >
                                <thead>
                                    <tr>
                                        <td>Select Date (Optional)</td>
                                        <td colSpan="6">
                                            <input
                                                type="date"
                                                name="selected_date"
                                                value={selectedDate}
                                                onChange={(event) =>
                                                    setSelectedDate(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <th>Employee Name</th>
                                        {STATUSES.map((status) => (
                                            <th key={status.value}>
                                                {status.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td colSpan="7">
                                                Loading employees...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && employees.length === 0 && (
                                        <tr>
                                            <td colSpan="7">
                                                No active employees found.
                                            </td>
                                        </tr>
                                    )}

                                    {!loading &&
                                        employees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td>{employee.custName}</td>

                                                {STATUSES.map((status) => (
                                                    <td key={status.value}>
                                                        <input
                                                            type="checkbox"
                                                            aria-label={`${status.label} for ${employee.custName}`}
                                                            checked={
                                                                attendanceByEmployee[
                                                                    employee.id
                                                                ] === status.value
                                                            }
                                                            onChange={() =>
                                                                handleStatusChange(
                                                                    employee.id,
                                                                    status.value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}

                                    <tr>
                                        <th colSpan="7">
                                            <button
                                                type="submit"
                                                name="addAttendanceBTN"
                                                disabled={saving || loading}
                                            >
                                                {saving
                                                    ? "Saving..."
                                                    : "Submit Attendance"}
                                            </button>
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default AddAttendance;