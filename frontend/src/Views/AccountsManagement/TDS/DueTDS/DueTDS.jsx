import { useEffect, useMemo, useState } from "react";
import tdsService from "../../../../services/tdsService";
import "./DueTDS.css";

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const DueTDS = () => {
    const [payments, setPayments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const data = await tdsService.getDueTds();
                if (active) setPayments(Array.isArray(data) ? data : []);
            } catch (loadError) {
                if (active) {
                    setError(loadError.message || "Could not load Due TDS.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, []);

    const filteredPayments = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return payments;

        return payments.filter((payment) =>
            [payment.name, payment.paymentDate]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [payments, search]);

    const totalTdsPaise = filteredPayments.reduce(
        (sum, payment) =>
            sum + Math.round(Number(payment.tdsAmount || 0) * 100),
        0
    );

    const handleMarkPaid = async (payment) => {
        if (savingId !== null) return;

        const confirmed = window.confirm(
            `Mark ${payment.name} TDS paid?`
        );
        if (!confirmed) return;

        setSavingId(payment.paymentId);
        setError("");

        try {
            await tdsService.markTdsPaid(payment.paymentId);
            setPayments((current) =>
                current.filter(
                    (item) => item.paymentId !== payment.paymentId
                )
            );
        } catch (saveError) {
            setError(saveError.message || "Could not mark TDS as paid.");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page due-tds-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">💰</span>
                                Due TDS
                            </h1>
                            <p className="view-clients-subtitle">
                                Review and mark company TDS payments as paid
                            </p>
                        </div>
                        <span className="view-clients-count">
                            Due Records: {filteredPayments.length}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-clients-filter">
                            <div className="view-client-search-wrap">
                                <span className="view-client-search-icon">🔍</span>
                                <input
                                    className="view-client-search"
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by company or candidate"
                                    aria-label="Search Due TDS"
                                />
                            </div>
                        </div>

                        {error && <p role="alert">{error}</p>}
                        {loading && <p>Loading Due TDS...</p>}

                        {!loading && (
                            <div className="view-clients-table-wrapper">
                                <table className="view-clients-table">
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Client Name</th>
                                            <th>TDS Amount</th>
                                            <th>Payment Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.length > 0 ? (
                                            filteredPayments.map((payment, index) => (
                                                <tr key={payment.paymentId}>
                                                    <td>{index + 1}</td>
                                                    <td className="view-client-name">
                                                        {payment.name}
                                                    </td>
                                                    <td>
                                                        ₹{formatAmount(payment.tdsAmount)}
                                                    </td>
                                                    <td>
                                                        {payment.paymentDate || "—"}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="due-tds-paid-button"
                                                            disabled={savingId !== null}
                                                            onClick={() => handleMarkPaid(payment)}
                                                        >
                                                            {savingId === payment.paymentId
                                                                ? "Saving..."
                                                                : "TDS Paid"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="view-client-no-data">
                                                    No Due TDS records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && (
                            <div className="view-client-total">
                                Total TDS Due (INR): ₹
                                {formatAmount(totalTdsPaise / 100)}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </section>
    );
};
export default DueTDS;