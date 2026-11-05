import { useEffect, useState } from "react";
import { useParams } from "react-router";
import gstBillService from "../../../../services/gstBillService";
import logo from "../../../../assets/logo.png";
import "./PrintGSTInvoice.css";

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const displayDate = (value) => {
    if (!value) return "—";
    const [year, month, day] = value.split("-");
    return `${day}-${month}-${year}`;
};

const underThousand = (value) => {
    const ones = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    let words = "";

    if (value >= 100) {
        words += `${ones[Math.floor(value / 100)]} Hundred`;
        value %= 100;
        if (value > 0) words += " and ";
    }
    if (value >= 20) {
        words += tens[Math.floor(value / 10)];
        if (value % 10) words += ` ${ones[value % 10]}`;
    } else if (value >= 10) {
        words += teens[value - 10];
    } else if (value > 0) {
        words += ones[value];
    }
    return words;
};

const amountInWords = (amount) => {
    const value = Math.round(Number(amount || 0) * 100) / 100;
    let rupees = Math.floor(value);
    const paise = Math.round((value - rupees) * 100);
    if (rupees === 0 && paise === 0) return "Rupees Zero Only";

    const crore = Math.floor(rupees / 10000000);
    rupees %= 10000000;
    const lakh = Math.floor(rupees / 100000);
    rupees %= 100000;
    const thousand = Math.floor(rupees / 1000);
    rupees %= 1000;
    const parts = [];
    if (crore) parts.push(`${underThousand(crore)} Crore`);
    if (lakh) parts.push(`${underThousand(lakh)} Lakh`);
    if (thousand) parts.push(`${underThousand(thousand)} Thousand`);
    if (rupees) parts.push(underThousand(rupees));

    let words = `Rupees ${parts.length ? parts.join(" ") : "Zero"}`;
    if (paise) words += ` And ${underThousand(paise)} Paise`;
    return `${words} Only`;
};

const PrintGSTInvoice = () => {
    const { invoiceId } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        gstBillService.getInvoice(invoiceId)
            .then((data) => {
                if (active) setInvoice(data);
            })
            .catch((loadError) => {
                if (active) setError(loadError.message || "Could not load this invoice.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [invoiceId]);

    const download = async () => {
        if (!invoice || downloading) return;
        setDownloading(true);
        setError("");
        try {
            await gstBillService.downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
        } catch (downloadError) {
            setError(downloadError.message || "Could not download the invoice.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <section id="main-content"><p className="gst-print-loading">Loading invoice…</p></section>;
    if (!invoice) return <section id="main-content"><p className="gst-print-error" role="alert">{error || "Invoice not found."}</p></section>;

    const serviceDate = invoice.joiningDate || invoice.invoiceDate;

    return (
        <section id="main-content" className="gst-print-page">
            <div className="gst-print-toolbar">
                {error && <p role="alert">{error}</p>}
                <button type="button" onClick={download} disabled={downloading}>
                    {downloading ? "Preparing PDF…" : "Download Invoice"}
                </button>
                <button type="button" onClick={() => window.print()}>
                    Print Invoice
                </button>
            </div>

            <article className="gst-print-document">
                <div className="gst-print-company-header">
                    <div className="gst-print-logo-wrap">
                        <img src={logo} alt="Shul Ventures logo" />
                        <strong style={{ fontSize: '22px' }}>Shul Ventures Pvt. Ltd.</strong>
                    </div>
                    <div className="gst-print-company-details">
                        <strong>Shul Ventures Pvt. Ltd.</strong><br />
                        Bank A/C Number: 920020001745664<br />
                        IFSC: UTIB0001242<br />
                        Bank Name: AXIS Bank Ltd.<br />
                        Branch: Swavalambi Nagar, Nagpur<br />
                        GSTIN: 27ABACS2141Q1Z3
                    </div>
                </div>
                <div className="gst-print-rule" />

                <h1 className="gst-print-title">TAX INVOICE</h1>
                <p><strong>Invoice Date:</strong> {displayDate(invoice.invoiceDate)}</p>
                <p><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>

                <p className="gst-print-invoice-to"><strong>Invoice To:</strong></p>
                <table className="gst-print-address-table">
                    <thead>
                        <tr><th>Billing Address</th><th>Shipping Address</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            {[0, 1].map((item) => (
                                <td key={item}>
                                    <strong>{invoice.companyName}</strong><br />
                                    {invoice.shippingAddress}<br />
                                    GSTIN: {invoice.gstNumber}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>

                <table className="gst-print-items-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Joining Date</th>
                            <th>Description</th>
                            <th>Service Charges</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Consultant</td>
                            <td>{displayDate(serviceDate)}</td>
                            <td>Consultancy services</td>
                            <td className="gst-print-number">₹{formatAmount(invoice.amount)}</td>
                        </tr>
                        {invoice.gstType === "igst" && (
                            <tr><td colSpan={3} className="gst-print-tax-label">IGST (18%)</td><td className="gst-print-number">₹{formatAmount(invoice.igst)}</td></tr>
                        )}
                        {(invoice.gstType === "exclusive" || invoice.gstType === "inclusive") && (
                            <>
                                <tr><td colSpan={3} className="gst-print-tax-label">CGST (9%)</td><td className="gst-print-number">₹{formatAmount(invoice.cgst)}</td></tr>
                                <tr><td colSpan={3} className="gst-print-tax-label">SGST (9%)</td><td className="gst-print-number">₹{formatAmount(invoice.sgst)}</td></tr>
                            </>
                        )}
                        <tr className="gst-print-total">
                            <td colSpan={3}><strong>Total Amount</strong></td>
                            <td className="gst-print-number"><strong>₹{formatAmount(invoice.totalAmount)}</strong></td>
                        </tr>
                        <tr>
                            <td colSpan={4} className="gst-print-words">
                                <strong>(In Words: {amountInWords(invoice.totalAmount)})</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p className="gst-print-system-note">
                    <strong>(This is system generated PDF; signature &amp; stamp not required)</strong>
                </p>

                <footer className="gst-print-footer">
                    <div className="gst-print-rule" />
                    <div className="gst-print-contact">
                        <span>+91-9764385996</span>
                        <span>www.shulventures.com</span>
                        <span>support@shulventures.com</span>
                    </div>
                    <p>Shree Ganesh Apartment, Ring Road, Plot No. 32, above Rajat Wines, Khamla, Nagpur, Maharashtra 440015</p>
                    <p>CIN: U74999MH2018PTC308404</p>
                    <div className="gst-print-rule" />
                </footer>
            </article>
        </section>
    );
};

export default PrintGSTInvoice;
