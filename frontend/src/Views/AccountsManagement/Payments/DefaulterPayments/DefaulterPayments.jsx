import { useEffect, useMemo, useState } from "react";
import paymentService from "../../../../services/paymentService";
import "./DefaulterPayments.css";

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const DefaulterPayments = () => {
    const [payments, setPayments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reactivatingClientId, setReactivatingClientId] = useState(null);

    useEffect(() => {
        let active = true;

        const loadPayments = async () => {
            try {
                const data = await paymentService.getDefaulterPayments();
                if (active) setPayments(Array.isArray(data) ? data : []);
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load defaulter payments."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadPayments();

        return () => {
            active = false;
        };
    }, []);

    const filteredPayments = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return payments;

        return payments.filter((payment) =>
            [payment.name, payment.defaulterNote, payment.dueDate]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [payments, search]);

    const totalDue = filteredPayments.reduce(
        (sum, payment) => sum + Number(payment.dueAmount || 0),
        0
    );

    const handleReactivate = async (payment) => {
        if (!payment.clientId || reactivatingClientId) return;

        const confirmed = window.confirm(
            `Reactivate ${payment.name}?\n\n` +
                "All defaulted payment records for this client will be set to active."
        );

        if (!confirmed) return;

        setReactivatingClientId(payment.clientId);
        setError("");

        try {
            await paymentService.reactivateClient(payment.clientId);

            setPayments((current) =>
                current.filter(
                    (row) => row.clientId !== payment.clientId
                )
            );
        } catch (reactivateError) {
            setError(
                reactivateError.message || "Could not reactivate this client."
            );
        } finally {
            setReactivatingClientId(null);
        }
    };

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">💰</span>
                                Defaulters Payments
                            </h1>
                            <p className="view-clients-subtitle">
                                View and manage defaulted payment records
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {filteredPayments.length}{" "}
                            {filteredPayments.length === 1 ? "record" : "records"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-clients-filter">
                            <div className="view-client-search-wrap">
                                <span className="view-client-search-icon">🔍</span>
                                <input
                                    type="text"
                                    className="view-client-search"
                                    placeholder="Search by Name or Reason"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {loading && <p>Loading defaulter payments...</p>}
                        {!loading && error && <p role="alert">{error}</p>}

                        {!loading && !error && (
                            <>
                                <div className="view-clients-table-wrapper">
                                    <table className="view-clients-table">
                                        <thead>
                                            <tr>
                                                <th>Sr. No.</th>
                                                <th style={{ minWidth: "200px" }}>Name</th>
                                                <th>Total Amount</th>
                                                <th>Paid Amount</th>
                                                <th>Reasons</th>
                                                <th>Due Amount</th>
                                                <th>Due Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredPayments.length > 0 ? (
                                                filteredPayments.map((payment , index) => (
                                                    <tr key={payment.paymentId}>
                                                        <td>{index + 1}</td>
                                                        <td
                                                            className="view-client-name"
                                                            style={{ fontWeight: "600" }}
                                                        >
                                                            {payment.name || "—"}
                                                        </td>
                                                        <td className="view-client-total-amount">
                                                            ₹{formatAmount(payment.totalAmount)}
                                                        </td>
                                                        <td className="view-client-paid-amount">
                                                            ₹{formatAmount(payment.paidAmount)}
                                                        </td>
                                                        <td className="view-client-reason">
                                                            {payment.defaulterNote || "—"}
                                                        </td>
                                                        <td className="view-client-due-amount">
                                                            ₹{formatAmount(payment.dueAmount)}
                                                        </td>
                                                        <td className="view-client-date-cell">
                                                            {payment.dueDate || "—"}
                                                        </td>
                                                        
                                                        <td className="view-client-action">
                                                            <button
                                                                type="button"
                                                                className="view-client-action-btn"
                                                                disabled={
                                                                    reactivatingClientId ===
                                                                    payment.clientId
                                                                }
                                                                onClick={() =>
                                                                    handleReactivate(payment)
                                                                }
                                                            >
                                                                {reactivatingClientId ===
                                                                payment.clientId
                                                                    ? "Reactivating..."
                                                                    : "Reactivate"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="view-client-no-data"
                                                    >
                                                        No defaulter payment records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <section id="total-due-amount">
                                    <h4>
                                        Total Due Amount (INR):{" "}
                                        <span>₹{formatAmount(totalDue)}</span>
                                    </h4>
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </section>
    );
};
export default DefaulterPayments;