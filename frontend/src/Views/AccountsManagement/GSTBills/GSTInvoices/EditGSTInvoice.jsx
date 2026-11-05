import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import gstBillService from "../../../../services/gstBillService";
import "./EditGSTInvoice.css";

const today = () => {
    const date = new Date();
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
};

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const calculateInvoice = (inputAmount, gstType) => {
    const amount = Number(inputAmount) || 0;
    let baseAmount = amount;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let totalAmount = amount;

    if (gstType === "exclusive") {
        const totalTax = roundMoney(amount * 0.18);
        cgst = roundMoney(totalTax / 2);
        sgst = roundMoney(totalTax - cgst);
        totalAmount = roundMoney(amount + totalTax);
    } else if (gstType === "inclusive") {
        baseAmount = roundMoney(amount / 1.18);
        const totalTax = roundMoney(amount - baseAmount);
        cgst = roundMoney(totalTax / 2);
        sgst = roundMoney(totalTax - cgst);
        totalAmount = amount;
    } else if (gstType === "igst") {
        igst = roundMoney(amount * 0.18);
        totalAmount = roundMoney(amount + igst);
    }

    return { baseAmount, cgst, sgst, igst, totalAmount };
};

const EditGSTInvoice = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [gstType, setGstType] = useState("inclusive");
    const [amount, setAmount] = useState("");
    const [invoiceDate, setInvoiceDate] = useState("");
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        gstBillService.getInvoice(invoiceId)
            .then((data) => {
                if (!active) return;
                setInvoice(data);
                setGstType(data.gstType || "inclusive");
                setAmount(
                    Number(
                        data.gstType === "inclusive"
                            ? data.totalAmount
                            : data.amount
                    ).toFixed(2)
                );
                setInvoiceDate(data.invoiceDate || today());
                setComments(data.comments || "");
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

    const totals = useMemo(
        () => calculateInvoice(amount, gstType),
        [amount, gstType]
    );

    const openConfirmation = (event) => {
        event.preventDefault();
        setError("");
        if (Number(amount) <= 0) {
            setError("Enter an amount greater than zero.");
            return;
        }
        if (!invoiceDate) {
            setError("Select an invoice date.");
            return;
        }
        setShowConfirmation(true);
    };

    const confirmUpdate = async () => {
        if (!invoice || saving) return;
        setSaving(true);
        setError("");

        try {
            await gstBillService.updateInvoice(invoice.id, {
                gstType,
                amount: Number(amount),
                invoiceDate,
                comments: comments.trim(),
            });
            navigate("/accounts/gst-Invoice");
        } catch (saveError) {
            setShowConfirmation(false);
            setError(saveError.message || "Could not update the invoice.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <section id="main-content"><p className="edit-gst-message">Loading invoice…</p></section>;
    }

    if (!invoice) {
        return (
            <section id="main-content">
                <div className="edit-gst-page">
                    <div className="edit-gst-card">
                        <p className="edit-gst-error" role="alert">{error || "Invoice not found."}</p>
                        <button type="button" className="edit-gst-secondary" onClick={() => navigate("/accounts/gst-Invoice")}>
                            Back to GST Invoices
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="main-content">
            <div className="edit-gst-page">
                <div className="edit-gst-card">
                    <header className="edit-gst-header">
                        <span>🧾</span>
                        <div>
                            <h1>Edit GST Invoice</h1>
                            <p>Update invoice details for invoice {invoice.invoiceNumber}</p>
                        </div>
                    </header>

                    <form className="edit-gst-form" onSubmit={openConfirmation}>
                        {error && <p className="edit-gst-error" role="alert">{error}</p>}

                        <label className="edit-gst-field">
                            <span>Name</span>
                            <input value={invoice.companyName || ""} readOnly />
                        </label>

                        <label className="edit-gst-field">
                            <span>GST Number</span>
                            <input value={invoice.gstNumber || ""} readOnly />
                        </label>

                        <div className="edit-gst-row">
                            <label className="edit-gst-field">
                                <span>Invoice Date *</span>
                                <input
                                    type="date"
                                    value={invoiceDate}
                                    max={today()}
                                    onChange={(event) => setInvoiceDate(event.target.value)}
                                    required
                                />
                            </label>
                            <label className="edit-gst-field">
                                <span>GST Type *</span>
                                <select value={gstType} onChange={(event) => setGstType(event.target.value)}>
                                    <option value="exclusive">Add GST (18%)</option>
                                    <option value="normal">No GST</option>
                                    <option value="inclusive">GST Included</option>
                                    <option value="igst">Add IGST (18%)</option>
                                </select>
                            </label>
                        </div>

                        <label className="edit-gst-field">
                            <span>{gstType === "inclusive" ? "Invoice Amount (GST Included) *" : "Amount (Basic) *"}</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                required
                            />
                        </label>

                        <div className="edit-gst-totals">
                            <div><label>Taxable Amount</label><output>₹{formatAmount(totals.baseAmount)}</output></div>
                            <div><label>CGST</label><output>₹{formatAmount(totals.cgst)}</output></div>
                            <div><label>SGST</label><output>₹{formatAmount(totals.sgst)}</output></div>
                            <div><label>IGST</label><output>₹{formatAmount(totals.igst)}</output></div>
                            <div className="edit-gst-total"><label>Total Amount</label><output>₹{formatAmount(totals.totalAmount)}</output></div>
                        </div>

                        <label className="edit-gst-field">
                            <span>Comments</span>
                            <textarea
                                rows={4}
                                maxLength={2000}
                                value={comments}
                                onChange={(event) => setComments(event.target.value)}
                            />
                        </label>

                        <div className="edit-gst-actions">
                            <button type="button" className="edit-gst-secondary" onClick={() => navigate("/accounts/gst-Invoice")}>
                                Cancel
                            </button>
                            <button type="submit" className="edit-gst-primary" disabled={saving}>
                                Update Invoice
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showConfirmation && (
                <div className="edit-gst-confirm-backdrop" role="presentation">
                    <div className="edit-gst-confirm" role="dialog" aria-modal="true" aria-labelledby="edit-gst-confirm-title">
                        <h2 id="edit-gst-confirm-title">Confirm invoice update</h2>
                        <p>Save these changes to invoice {invoice.invoiceNumber} and open the print dialog?</p>
                        <div className="edit-gst-actions">
                            <button
                                type="button"
                                className="edit-gst-secondary"
                                onClick={() => setShowConfirmation(false)}
                                disabled={saving}
                            >
                                Review Changes
                            </button>
                            <button
                                type="button"
                                className="edit-gst-primary"
                                onClick={confirmUpdate}
                                disabled={saving}
                            >
                                {saving ? "Updating…" : "Confirm & Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
export default EditGSTInvoice;
