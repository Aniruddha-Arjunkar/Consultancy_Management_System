import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import gstBillService from "../../../../services/gstBillService";
import "./GSTInvoices.css";

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const GSTInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [openActionId, setOpenActionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        gstBillService.getInvoices()
            .then((data) => {
                if (active) setInvoices(Array.isArray(data) ? data : []);
            })
            .catch((loadError) => {
                if (active) {
                    setError(loadError.message || "Could not load GST invoices.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const filteredInvoices = useMemo(() => {
        const query = search.trim().toLowerCase();

        return invoices.filter((invoice) => {
            const invoiceDate = invoice.invoiceDate || "";
            const matchesDate =
                (!fromDate || invoiceDate >= fromDate) &&
                (!toDate || invoiceDate <= toDate);

            const matchesSearch =
                !query ||
                [
                    invoice.invoiceNumber,
                    invoice.invoiceDate,
                    invoice.companyName,
                    invoice.phone,
                    invoice.shippingAddress,
                    invoice.comments,
                ]
                    .filter((value) => value !== null && value !== undefined)
                    .join(" ")
                    .toLowerCase()
                    .includes(query);

            return matchesDate && matchesSearch;
        });
    }, [invoices, search, fromDate, toDate]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page gst-invoices-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">🧾</span>
                                GST Invoices
                            </h1>
                            <p className="view-clients-subtitle">
                                View and manage generated company invoices
                            </p>
                        </div>
                        <span className="view-clients-count">
                            {filteredInvoices.length}{" "}
                            {filteredInvoices.length === 1 ? "invoice" : "invoices"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-clients-filter gst-invoices-filter">
                            <div className="view-client-search-wrap">
                                <span className="view-client-search-icon">🔍</span>
                                <input
                                    type="search"
                                    className="view-client-search"
                                    placeholder="Search invoices..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    aria-label="Search GST invoices"
                                />
                            </div>
                            <input
                                type="date"
                                className="view-client-date"
                                aria-label="From invoice date"
                                value={fromDate}
                                onChange={(event) => setFromDate(event.target.value)}
                            />
                            <input
                                type="date"
                                className="view-client-date"
                                aria-label="To invoice date"
                                value={toDate}
                                onChange={(event) => setToDate(event.target.value)}
                            />
                        </div>

                        {error && <p className="gst-invoices-error" role="alert">{error}</p>}
                        {loading && <p className="gst-invoices-message">Loading GST invoices…</p>}

                        {!loading && !error && (
                            <div className="view-clients-table-wrapper">
                                <table className="view-clients-table gst-invoices-table">
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Invoice No.</th>
                                            <th>Invoice Date</th>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Address</th>
                                            <th>Comments</th>
                                            <th>Amount</th>
                                            <th>Total Amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInvoices.length ? (
                                            filteredInvoices.map((invoice, index) => (
                                                <tr key={invoice.id}>
                                                    <td>{index + 1}</td>
                                                    <td style={{fontWeight:'600', fontSize:'16px'}}>{invoice.invoiceNumber || "—"}</td>
                                                    <td>{invoice.invoiceDate || "—"}</td>
                                                    <td className="gst-invoices-name">
                                                        {invoice.companyName || "—"}
                                                    </td>
                                                    <td>{invoice.phone || "—"}</td>
                                                    <td className="gst-invoices-address">
                                                        {invoice.shippingAddress || "—"}
                                                    </td>
                                                    <td>{invoice.comments || "—"}</td>
                                                    <td>₹{formatAmount(invoice.amount)}</td>
                                                    <td>₹{formatAmount(invoice.totalAmount)}</td>
                                                    <td className="gst-invoices-action-cell">
                                                        <button
                                                            type="button"
                                                            className="gst-invoices-action-toggle"
                                                            aria-expanded={openActionId === invoice.id}
                                                            onClick={() =>
                                                                setOpenActionId((current) =>
                                                                    current === invoice.id
                                                                        ? null
                                                                        : invoice.id
                                                                )
                                                            }
                                                        >
                                                            Action ▾
                                                        </button>
                                                        {openActionId === invoice.id && (
                                                            <div className="gst-invoices-action-menu">
                                                                <button
                                                                    type="button"
                                                                    className="get-invoice-action-edit-btn"
                                                                    onClick={() => {
                                                                        setOpenActionId(null);
                                                                        navigate(`/accounts/gst-Invoice/${invoice.id}`);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="get-invoice-action-print-btn"
                                                                    onClick={() => {
                                                                        setOpenActionId(null);
                                                                        window.open(
                                                                            `/accounts/gst-Invoice/print/${invoice.id}`,
                                                                            "_blank",
                                                                            "noopener,noreferrer"
                                                                        );
                                                                    }}
                                                                >
                                                                    Print
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={10} className="gst-invoices-empty">
                                                    No GST invoices found.
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
export default GSTInvoices;
