import { useEffect, useMemo, useState } from "react";
import paymentService from "../../../../services/paymentService";
import "./ViewPayment.css";

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const ViewPayment = () => {
    const [payments, setPayments] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadPayments = async () => {
            try {
                const data = await paymentService.getPaymentHistory();
                if (active) setPayments(Array.isArray(data) ? data : []);
            } catch (loadError) {
                if (active) {
                    setError(loadError.message || "Could not load payment history.");
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

        return payments.filter((payment) => {
            const matchesSearch =
                !query ||
                [
                    payment.name,
                    payment.branch,
                    payment.service,
                    payment.paymentGateway,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(query);

            const matchesFromDate =
                !fromDate || payment.paymentDate >= fromDate;
            const matchesEndDate =
                !endDate || payment.paymentDate <= endDate;

            return matchesSearch && matchesFromDate && matchesEndDate;
        });
    }, [payments, search, fromDate, endDate]);

    const totalPaid = filteredPayments.reduce(
        (sum, payment) => sum + Number(payment.paidAmount || 0),
        0
    );

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page view-payment-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">💳</span>
                                Payment History
                            </h1>
                            <p className="view-clients-subtitle">
                                View recorded payments
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
                                    placeholder="Search by Name, Branch, Service, or Gateway"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    autoComplete="off"
                                />
                            </div>

                            <input
                                type="date"
                                className="view-client-date"
                                value={fromDate}
                                onChange={(event) => setFromDate(event.target.value)}
                                aria-label="From date"
                            />

                            <input
                                type="date"
                                className="view-client-date"
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                                aria-label="To date"
                            />
                        </div>

                        {loading && <p>Loading payment history...</p>}
                        {!loading && error && <p role="alert">{error}</p>}

                        {!loading && !error && (
                            <>
                                <div className="view-clients-table-wrapper">
                                    <table className="view-clients-table">
                                        <thead>
                                            <tr>
                                                <th>Sr. No.</th>
                                                <th style={{ minWidth: "280px" }}>Name</th>
                                                <th>Paid Amount</th>
                                                <th>Payment Date</th>
                                                <th>Gateway</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredPayments.length > 0 ? (
                                                filteredPayments.map((payment,index) => (
                                                    <tr key={payment.paymentId}>
                                                        <td>{index + 1}</td>
                                                        <td
                                                            className="view-client-name"
                                                            style={{ fontWeight: "600" }}
                                                        >
                                                            {payment.name || "—"}
                                                        </td>
                                                        <td className="view-client-paid-amount">
                                                            ₹{formatAmount(payment.paidAmount)}
                                                        </td>
                                                        <td className="view-client-date-cell">
                                                            {payment.paymentDate || "—"}
                                                        </td>
                                                        <td>
                                                            {payment.paymentGateway || "—"}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="view-client-no-data">
                                                        No payment records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <section id="total-paid-amount">
                                    <h4>
                                        Total Paid Amount (INR):{" "}
                                        <span>₹{formatAmount(totalPaid)}</span>
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
export default ViewPayment;