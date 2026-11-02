import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import paymentService from "../../../../services/paymentService";
import "./DuePayment.css";

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const DuePayment = () => {
    const [payments, setPayments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
const [openActionId, setOpenActionId] = useState(null);
const [defaulterTarget, setDefaulterTarget] = useState(null);
const [defaulterNote, setDefaulterNote] = useState("");
const [defaulterError, setDefaulterError] = useState("");
const [markingDefaulter, setMarkingDefaulter] = useState(false);

    useEffect(() => {
        let active = true;

        const loadPayments = async () => {
            try {
                const data = await paymentService.getDuePayments();

                if (active) {
                    setPayments(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load due payments."
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
            [
                payment.name,
                payment.branch,
                payment.service,
                payment.phone,
                payment.dueDate,
            ]
                .filter((value) => value !== null && value !== undefined)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [payments, search]);

    const totalDuePaise = filteredPayments.reduce(
        (sum, payment) =>
            sum + Math.round(Number(payment.dueAmount || 0) * 100),
        0
    );

    const submitDefaulter = async (event) => {
    event.preventDefault();
    if (!defaulterTarget || markingDefaulter) return;

    setMarkingDefaulter(true);
    setDefaulterError("");

    try {
        await paymentService.markClientDefaulter(
            defaulterTarget.clientId,
            defaulterNote.trim()
        );

        setPayments((current) =>
            current.filter(
                (payment) =>
                    payment.clientId !== defaulterTarget.clientId
            )
        );
        setDefaulterTarget(null);
        setDefaulterNote("");
    } catch (submitError) {
        setDefaulterError(
            submitError.message || "Could not mark this client as a defaulter."
        );
    } finally {
        setMarkingDefaulter(false);
    }
};

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page due-payment-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    💰
                                </span>
                                Due Payments
                            </h1>
                            <p className="view-clients-subtitle">
                                View and manage due payment records
                            </p>
                        </div>

                        <span className="view-clients-count">
                            Due Records: {filteredPayments.length}
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
                                    id="txt_searchall"
                                    className="view-client-search"
                                    placeholder="Search by Name or Phone"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    autoComplete="off"
                                    aria-label="Search due payments"
                                />
                            </div>
                        </div>

                        {loading && <p>Loading due payments...</p>}
                        {!loading && error && <p role="alert">{error}</p>}

                        {!loading && !error && (
                            <>
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
                                                <th style={{ minWidth: "280px" }}>Name</th>
                                                <th>Phone No</th>
                                                <th>Total Amount</th>
                                                <th>Paid Amount</th>
                                                <th>Due Amount</th>
                                                <th>Due Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredPayments.length > 0 ? (
                                                filteredPayments.map(
                                                    (payment , index) => (
                                                        <tr key={payment.paymentId}>
                                                            <td>{index + 1}</td>
                                                            <td className="view-client-name" style={{ fontWeight: "600" }}>
                                                                {payment.name || "—"}
                                                            </td>
                                                            <td className="view-client-phone">
                                                                {payment.phone || "—"}
                                                            </td>
                                                            <td className="view-client-total-amount">
                                                                ₹{formatAmount(payment.totalAmount)}
                                                            </td>
                                                            <td className="view-client-paid-amount">
                                                                ₹{formatAmount(payment.paidAmount)}
                                                            </td>
                                                            <td className="view-client-due-amount" style={{ fontWeight: "600" }}>
                                                                ₹{formatAmount(payment.dueAmount)}
                                                            </td>
                                                            <td className="view-client-date-cell">
                                                                {payment.dueDate || "—"}
                                                            </td>
                                                            <td className="view-client-action">
    <button
        type="button"
        className="view-client-action-btn"
        onClick={() =>
            setOpenActionId((current) =>
                current === payment.paymentId
                    ? null
                    : payment.paymentId
            )
        }
    >
        Action
        <span className="view-client-action-arrow">
            {openActionId === payment.paymentId ? "▲" : "▼"}
        </span>
    </button>

    {openActionId === payment.paymentId && (
        <div className="view-client-action-buttons show">
            <button
                type="button"
                className="view-client-view-btn"
                onClick={() =>
                    navigate(
                        `/accounts/due-payment/update/${payment.paymentId}`
                    )
                }
            >
                Update
            </button>

            <button
                type="button"
                className="view-client-defaulter-btn"
                onClick={() => {
                    setOpenActionId(null);
                    setDefaulterTarget(payment);
                    setDefaulterNote("");
                    setDefaulterError("");
                }}
            >
                Mark Defaulter
            </button>
        </div>
    )}
</td>
                                                        </tr>
                                                    )
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={9}
                                                        className="view-client-no-data"
                                                    >
                                                        No due payment records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <section id="total-due-amount">
                                    <h4>
                                        Total Due Amount (INR):{" "}
                                        <span id="total-due">
                                            {formatAmount(totalDuePaise / 100)}
                                        </span>
                                    </h4>
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {defaulterTarget && (
    <div
        className="defaulter-modal-overlay"
        onClick={(event) => {
            if (event.target === event.currentTarget && !markingDefaulter) {
                setDefaulterTarget(null);
            }
        }}
    >
        <form
            className="defaulter-modal"
            onSubmit={submitDefaulter}
        >
            <h2>Mark Client as Defaulter</h2>

            <label>Client Name</label>
            <input
                type="text"
                value={defaulterTarget.name || ""}
                readOnly
            />

            <label htmlFor="defaulter-note">Reason</label>
            <textarea
                id="defaulter-note"
                rows={4}
                value={defaulterNote}
                onChange={(event) => setDefaulterNote(event.target.value)}
                maxLength={1000}
                required
            />

            {defaulterError && (
                <p role="alert">{defaulterError}</p>
            )}

            <div className="defaulter-modal-actions">
                <button
                    type="button"
                    className="defaulter-cancel-btn"
                    disabled={markingDefaulter}
                    onClick={() => setDefaulterTarget(null)}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="defaulter-submit-btn"
                    disabled={markingDefaulter}
                >
                    {markingDefaulter ? "Saving..." : "Submit"}
                </button>
            </div>
        </form>
    </div>
)}
        </section>

        
    );
};
export default DuePayment;