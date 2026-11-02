import { useEffect, useMemo, useState } from "react";
import advanceService from "../../../../services/advanceService";
import { useNavigate } from "react-router";
import "./ViewAdvance.css";

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);

const ViewAdvance = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        const loadPendingAdvances = async () => {
            try {
                const data = await advanceService.getPendingAdvances();

                if (active) {
                    setEmployees(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message ||
                        "Could not load pending employee advances."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadPendingAdvances();

        return () => {
            active = false;
        };
    }, []);

    const filteredEmployees = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return employees;

        return employees.filter((employee) =>
            employee.employeeName?.toLowerCase().includes(query)
        );
    }, [employees, search]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page view-advance-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    💰
                                </span>
                                Employee Pending Advance Details
                            </h1>

                            <p className="view-clients-subtitle">
                                View and manage pending employee advances
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {employees.length}{" "}
                            {employees.length === 1 ? "record" : "records"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-clients-filter">
                            <div className="view-client-search-wrap">
                                <span className="view-client-search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    className="view-client-search"
                                    placeholder="Search employees..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    autoComplete="off"
                                    aria-label="Search employees"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="view-advance-error" role="alert">
                                {error}
                            </p>
                        )}

                        {loading ? (
                            <p>Loading pending advances...</p>
                        ) : (
                            <div
                                className="view-clients-table-wrapper"
                                id="scrollable-content"
                            >
                                <table
                                    className="view-clients-table"
                                    id="payments-table"
                                >
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Employee Name</th>
                                            <th>Pending (₹)</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map(
                                                (employee, index) => (
                                                    <tr key={employee.employeeId}>
                                                        <td className="view-client-sr">
                                                            {index + 1}
                                                        </td>

                                                        <td className="view-client-name">
                                                            {employee.employeeName}
                                                        </td>

                                                        <td className="view-client-pending">
                                                            ₹{" "}
                                                            {formatCurrency(
                                                                employee.pendingAdvance
                                                            )}
                                                        </td>

                                                        <td className="view-client-action">
                                                            <button
                                                                type="button"
                                                                className="view-client-view-btn"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/accounts/view-advance/${employee.employeeId}`
                                                                    )
                                                                }
                                                            >
                                                                👁 View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="view-client-no-data"
                                                >
                                                    {search.trim()
                                                        ? "No matching employees found."
                                                        : "✅ All employee advances are fully cleared!"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </section>
    );
};
export default ViewAdvance;