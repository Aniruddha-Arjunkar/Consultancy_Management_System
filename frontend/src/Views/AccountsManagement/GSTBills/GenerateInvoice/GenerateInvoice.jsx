import { useEffect, useMemo, useState } from "react";
import gstBillService from "../../../../services/gstBillService";
import "./GenerateInvoice.css";

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const GenerateInvoice = () => {
    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadBills = async () => {
            try {
                const data = await gstBillService.getGenerateBills();
                if (active) setBills(Array.isArray(data) ? data : []);
            } catch (loadError) {
                if (active) {
                    setError(loadError.message || "Could not load eligible company bills.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadBills();
        return () => {
            active = false;
        };
    }, []);

    const filteredBills = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return bills;

        return bills.filter((bill) =>
            [bill.name, bill.phone, bill.address, bill.serviceDate]
                .filter((value) => value !== null && value !== undefined)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [bills, search]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page gst-generate-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">🧾</span>
                                Generate Bills
                            </h1>
                            <p className="view-clients-subtitle">
                                Company placements with GST details ready for invoicing
                            </p>
                        </div>
                        <span className="view-clients-count">
                            {filteredBills.length} {filteredBills.length === 1 ? "record" : "records"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-clients-filter">
                            <div className="view-client-search-wrap">
                                <span className="view-client-search-icon">🔍</span>
                                <input
                                    type="search"
                                    className="view-client-search"
                                    placeholder="Search company, candidate, phone, or address"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    autoComplete="off"
                                    aria-label="Search company bills"
                                />
                            </div>
                        </div>

                        {loading && <p className="gst-generate-message">Loading company bills…</p>}
                        {!loading && error && <p className="gst-generate-message error" role="alert">{error}</p>}

                        {!loading && !error && (
                            <div className="view-clients-table-wrapper">
                                <table className="view-clients-table gst-generate-table">
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Name</th>
                                            <th>Phone No.</th>
                                            <th>Due Date</th>
                                            <th>Address</th>
                                            <th>Final Amount</th>
                                            <th>Paid Amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBills.length ? filteredBills.map((bill, index) => (
                                            <tr key={bill.interviewId}>
                                                <td>{index + 1}</td>
                                                <td className="gst-generate-name">{bill.name || "—"}</td>
                                                <td>{bill.phone || "—"}</td>
                                                <td>{bill.serviceDate || "—"}</td>
                                                <td className="gst-generate-address">{bill.address || "—"}</td>
                                                <td>₹{formatAmount(bill.finalAmount)}</td>
                                                <td>₹{formatAmount(bill.paidAmount)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="gst-generate-action"
                                                        disabled
                                                        title="Invoice generation will be implemented next"
                                                    >
                                                        Generate Invoice
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={8} className="gst-generate-empty">
                                                    {search
                                                        ? "No matching company bills found."
                                                        : "No company bills meet the GST details requirements."}
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

export default GenerateInvoice;
