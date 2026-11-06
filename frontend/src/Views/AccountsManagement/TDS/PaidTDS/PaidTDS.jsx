import { useEffect, useMemo, useState } from "react";
import tdsService from "../../../../services/tdsService";
import "./PaidTDS.css";

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const PaidTDS = () => {
    const [payments, setPayments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const data = await tdsService.getPaidTds();

                if (active) {
                    setPayments(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load Paid TDS records."
                    );
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

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page paid-tds-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">💰</span>
                                Paid TDS
                            </h1>
                            <p className="view-clients-subtitle">
                                View all paid company TDS records
                            </p>
                        </div>

                        <span className="view-clients-count">
                            Paid Records: {filteredPayments.length}
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
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search by company or candidate"
                                    aria-label="Search Paid TDS"
                                />
                            </div>
                        </div>

                        {loading && <p>Loading Paid TDS records...</p>}
                        {!loading && error && <p role="alert">{error}</p>}

                        {!loading && !error && (
                            <>
                                <div className="view-clients-table-wrapper">
                                    <table className="view-clients-table">
                                        <thead>
                                            <tr>
                                                <th>Sr. No.</th>
                                                <th>Client Name</th>
                                                <th>TDS Amount Paid</th>
                                                <th>Payment Date</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredPayments.length > 0 ? (
                                                filteredPayments.map(
                                                    (payment, index) => (
                                                        <tr key={payment.paymentId}>
                                                            <td>{index + 1}</td>
                                                            <td className="view-client-name" style={{fontWeight:'600'}}>
                                                                {payment.name}
                                                            </td>
                                                            <td>
                                                                ₹{formatAmount(payment.tdsAmount)}
                                                            </td>
                                                            <td>
                                                                {payment.paymentDate || "—"}
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
                                                        No paid TDS records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="view-client-total">
                                    Total Paid TDS (INR): ₹
                                    {formatAmount(totalTdsPaise / 100)}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </section>
    );
};
export default PaidTDS;