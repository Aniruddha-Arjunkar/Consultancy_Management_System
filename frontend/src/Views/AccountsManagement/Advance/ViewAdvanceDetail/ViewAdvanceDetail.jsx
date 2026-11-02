import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import advanceService from "../../../../services/advanceService";
import "./ViewAdvanceDetail.css";

const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}`;
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);

const formatMonth = (month) => {
    if (!month) return "—";

    const [year, monthNumber] = month.split("-").map(Number);
    return new Date(year, monthNumber - 1, 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });
};

const ViewAdvanceDetail = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const [month, setMonth] = useState(getCurrentMonth());
    const [appliedMonth, setAppliedMonth] = useState(getCurrentMonth());
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadDetails = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await advanceService.getAdvanceDetails(
                    employeeId,
                    appliedMonth
                );

                if (active) setDetails(data);
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message ||
                            "Could not load employee advance details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDetails();

        return () => {
            active = false;
        };
    }, [employeeId, appliedMonth]);

    const handleFilter = (event) => {
        event.preventDefault();

        if (!month) {
            setError("Select a month.");
            return;
        }

        setAppliedMonth(month);
    };

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page advance-detail-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    💰
                                </span>
                                Advance Details
                            </h1>

                            <p className="view-clients-subtitle">
                                Employee:{" "}
                                <strong>
                                    {details?.employeeName || "—"}
                                </strong>
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {formatMonth(appliedMonth)}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <form
                            className="view-clients-filter"
                            onSubmit={handleFilter}
                        >
                            <input
                                type="month"
                                className="view-client-date"
                                value={month}
                                onChange={(event) =>
                                    setMonth(event.target.value)
                                }
                                aria-label="Select month"
                                required
                            />

                            <button
                                type="submit"
                                className="view-client-search-btn"
                            >
                                🔍 Filter
                            </button>

                            <button
                                type="button"
                                className="view-client-back-btn"
                                onClick={() =>
                                    navigate("/accounts/view-advance")
                                }
                            >
                                ← Back
                            </button>
                        </form>

                        {error && (
                            <p className="advance-detail-error" role="alert">
                                {error}
                            </p>
                        )}

                        {loading ? (
                            <p>Loading advance details...</p>
                        ) : details ? (
                            <>
                                <div className="view-client-info-box">
                                    <span className="view-client-info-title">
                                        Carry Forward from Previous Months
                                    </span>
                                    <span className="view-client-info-value">
                                        ₹ {formatCurrency(details.carryForward)}
                                    </span>
                                </div>

                                <div className="view-client-section-title">
                                    💵 Advance Taken - {formatMonth(details.month)}
                                </div>

                                <div className="view-clients-table-wrapper">
                                    <table className="view-clients-table">
                                        <thead>
                                            <tr>
                                                <th>Sr. No.</th>
                                                <th>Date</th>
                                                <th>Amount (₹)</th>
                                                <th>Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.advances.length > 0 ? (
                                                details.advances.map(
                                                    (advance, index) => (
                                                        <tr key={`${advance.date}-${index}`}>
                                                            <td className="view-client-sr">
                                                                {index + 1}
                                                            </td>
                                                            <td className="view-client-date-cell">
                                                                {advance.date}
                                                            </td>
                                                            <td className="view-client-amount">
                                                                ₹{" "}
                                                                {formatCurrency(
                                                                    advance.amount
                                                                )}
                                                            </td>
                                                            <td>
                                                                {advance.remark || "-"}
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
                                                        No advance records for
                                                        this month.
                                                    </td>
                                                </tr>
                                            )}

                                            <tr className="view-client-total-row">
                                                <td colSpan={2}>
                                                    Total (This Month)
                                                </td>
                                                <td>
                                                    ₹{" "}
                                                    {formatCurrency(
                                                        details.totalAdvanceCurrentMonth
                                                    )}
                                                </td>
                                                <td>-</td>
                                            </tr>

                                            <tr className="view-client-total-row">
                                                <td colSpan={2}>
                                                    Total Including Carry Forward
                                                </td>
                                                <td>
                                                    ₹{" "}
                                                    {formatCurrency(
                                                        details.totalAdvanceIncludingCarry
                                                    )}
                                                </td>
                                                <td>-</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="view-client-section-title">
                                    📉 Deductions (Recovered Advances)
                                </div>

                                <div className="view-clients-table-wrapper">
                                    <table className="view-clients-table">
                                        <thead>
                                            <tr>
                                                <th>Sr. No.</th>
                                                <th>Month</th>
                                                <th>Deducted Amount (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.deductions.length > 0 ? (
                                                details.deductions.map(
                                                    (deduction, index) => (
                                                        <tr
                                                            key={`${deduction.month}-${index}`}
                                                        >
                                                            <td className="view-client-sr">
                                                                {index + 1}
                                                            </td>
                                                            <td>
                                                                {deduction.month}
                                                            </td>
                                                            <td className="view-client-amount">
                                                                ₹{" "}
                                                                {formatCurrency(
                                                                    deduction.amount
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="view-client-no-data"
                                                    >
                                                        No deductions for this
                                                        month.
                                                    </td>
                                                </tr>
                                            )}

                                            <tr className="view-client-total-row">
                                                <td colSpan={2}>
                                                    Total Deduction (This Month)
                                                </td>
                                                <td>
                                                    ₹{" "}
                                                    {formatCurrency(
                                                        details.totalDeductionCurrentMonth
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="view-client-pending-box">
                                    <span className="view-client-pending-label">
                                        Pending Advance:
                                    </span>
                                    <span
                                        className={`view-client-pending-value ${
                                            Number(details.pending) > 0
                                                ? "pending-red"
                                                : "pending-green"
                                        }`}
                                    >
                                        ₹ {formatCurrency(details.pending)}
                                    </span>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </section>
        </section>
    );
};
export default ViewAdvanceDetail;