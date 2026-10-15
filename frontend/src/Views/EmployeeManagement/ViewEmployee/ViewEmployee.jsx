import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import "./ViewEmployee.css";
import employeesService from "../../../services/employeesService";

const ViewEmployee = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await employeesService.getEmployees();
                setEmployees(Array.isArray(data) ? data : []);
            } catch (error) {
                window.alert(error.message || "Could not load employees.");
            } finally {
                setLoading(false);
            }
        };

        loadEmployees();
    }, []);

    const filteredEmployees = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return employees;

        return employees.filter((employee) =>
            [
                employee.title,
                employee.custName,
                employee.custPhone,
                employee.custEmail,
                employee.joiningDate,
                employee.designation,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [employees, search]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    👨‍💼
                                </span>
                                View Employee
                            </h1>

                            <p className="view-clients-subtitle">
                                View and manage all employees
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {employees.length}{" "}
                            {employees.length === 1 ? "record" : "records"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-client-buttons">
                            <div className="view-client-search-wrap">
                                <span className="view-client-search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    id="txt_searchall"
                                    className="view-client-search"
                                    placeholder="Search employees..."
                                    autoComplete="off"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>

                            <Link
                                to="/employee/view-all-employee"
                                className="view-client-btn view-client-all-btn"
                            >
                                👥 View All Employees
                            </Link>

                            <Link
                                to="/employee/exit-employee"
                                className="view-client-btn view-client-exit-btn"
                            >
                                🚪 Exit Employee
                            </Link>

                            <Link
                                to="/employee/abscond-employee"
                                className="view-client-btn view-client-abscond-btn"
                            >
                                ⚠ Abscond Employee
                            </Link>
                        </div>

                        <br />

                        <div
                            className="view-clients-table-wrapper"
                            id="scrollable-content"
                        >
                            <table
                                className="view-clients-table"
                                id="employees-table"
                            >
                                <thead>
                                    <tr>
                                        <th>Sr. No.</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th style={{ minWidth: "120px" }}>
                                            Date
                                        </th>
                                        <th>Designation</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="view-client-no-data"
                                            >
                                                Loading employees...
                                            </td>
                                        </tr>
                                    ) : filteredEmployees.length > 0 ? (
                                        filteredEmployees.map(
                                            (employee, index) => (
                                                <tr key={employee.id}>
                                                    <td className="view-client-sr">
                                                        {index + 1}
                                                    </td>

                                                    <td className="view-client-name">
                                                        {[
                                                            employee.title,
                                                            employee.custName,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" ")}
                                                    </td>

                                                    <td className="view-client-phone">
                                                        {employee.custPhone || ""}
                                                    </td>

                                                    <td className="view-client-email">
                                                        {employee.custEmail || ""}
                                                    </td>

                                                    <td className="view-client-date-cell">
                                                        {employee.joiningDate || ""}
                                                    </td>

                                                    <td className="view-client-designation">
                                                        {employee.designation || ""}
                                                    </td>

                                                    <td className="view-client-action">
                                                        <a
                                                            href={`/employee/view-employee-detail/${employee.id}`}
                                                            className="view-client-action-btn"
                                                        >
                                                            👁 View All Details
                                                        </a>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="view-client-no-data"
                                            >
                                                {search.trim()
                                                    ? "No matching employees found."
                                                    : "No employees found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default ViewEmployee;