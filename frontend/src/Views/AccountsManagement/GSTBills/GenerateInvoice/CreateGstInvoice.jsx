import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import gstBillService from "../../../../services/gstBillService";

const today = () => {
    const date = new Date();
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
};

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const calculateAmounts = (amount, type) => {
    const sourceAmount = Number(amount) || 0;
    let baseAmount = sourceAmount;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let totalAmount = sourceAmount;

    if (type === "inclusive") {
        baseAmount = roundMoney(sourceAmount / 1.18);
        const totalTax = roundMoney(sourceAmount - baseAmount);
        cgst = roundMoney(totalTax / 2);
        sgst = roundMoney(totalTax - cgst);
    } else if (type === "exclusive") {
        const totalTax = roundMoney(sourceAmount * 0.18);
        cgst = roundMoney(totalTax / 2);
        sgst = roundMoney(totalTax - cgst);
        totalAmount = roundMoney(baseAmount + totalTax);
    } else if (type === "igst") {
        igst = roundMoney(sourceAmount * 0.18);
        totalAmount = roundMoney(baseAmount + igst);
    }

    return { baseAmount, cgst, sgst, igst, totalAmount };
};

const CreateGstInvoice = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [invoiceDate, setInvoiceDate] = useState(today);
    const [gstType, setGstType] = useState("inclusive");
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [createdInvoice, setCreatedInvoice] = useState(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setBill(null);
        setError("");
        gstBillService.getEligibleBill(interviewId)
            .then((data) => {
                if (active) setBill(data);
            })
            .catch((loadError) => {
                if (active) setError(loadError.message || "Could not load this company bill.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [interviewId]);

    const amounts = useMemo(
        () => calculateAmounts(bill?.finalAmount, gstType),
        [bill?.finalAmount, gstType]
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!bill || saving || createdInvoice) return;
        setSaving(true);
        setError("");
        try {
            const invoice = await gstBillService.createInvoice(interviewId, {
                gstType,
                invoiceDate,
                comments: comments.trim(),
            });
            setCreatedInvoice(invoice);
        } catch (submitError) {
            setError(submitError.message || "Could not generate the GST invoice.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <section id="main-content"><p className="gst-create-message">Loading invoice details…</p></section>;
    }

    if (!bill && !createdInvoice) {
        return (
            <section id="main-content">
                <div className="gst-create-page">
                    <div className="gst-create-card">
                        <p className="gst-create-message error" role="alert">{error || "This bill is not eligible for invoicing."}</p>
                        <button type="button" className="gst-create-secondary" onClick={() => navigate("/accounts/generate-invoice")}>
                            Back to Generate Bills
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (createdInvoice) {
        return (
            <section id="main-content">
                <div className="gst-create-page">
                    <div className="gst-create-card gst-create-success">
                        <div className="gst-create-success-icon">✓</div>
                        <h1>Invoice Generated</h1>
                        <p>Invoice No. <strong>{createdInvoice.invoiceNumber}</strong> has been saved.</p>
                        <p>Total: <strong>₹{formatAmount(createdInvoice.totalAmount)}</strong></p>
                        <button type="button" className="gst-create-submit" onClick={() => navigate("/accounts/generate-invoice")}>
                            Back to Generate Bills
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="main-content">
            <div className="gst-create-page">
                <div className="gst-create-card">
                    <header className="gst-create-header">
                        <h1>Generate GST Invoice</h1>
                        <p>Review the company and placement details, then create the invoice.</p>
                    </header>

                    <form className="gst-create-form" onSubmit={handleSubmit}>
                        {error && <p className="gst-create-message error" role="alert">{error}</p>}

                        <div className="gst-create-company">
                            <div>
                                <span>Company and placed candidate</span>
                                <strong>{bill.name}</strong>
                            </div>
                            <div>
                                <span>GST Number</span>
                                <strong>{bill.gstNumber}</strong>
                            </div>
                            <div>
                                <span>Shipping Address</span>
                                <strong>{bill.address}</strong>
                            </div>
                        </div>

                        <label className="gst-create-field">
                            <span>Full Payment Amount (₹)</span>
                            <input type="number" value={Number(bill.finalAmount || 0).toFixed(2)} readOnly />
                            <small>Loaded from the company payment record, including its saved GST amount.</small>
                        </label>

                        <label className="gst-create-field">
                            <span>GST Type</span>
                            <select value={gstType} onChange={(event) => setGstType(event.target.value)}>
                                <option value="exclusive">Add GST (18%)</option>
                                <option value="igst">Add IGST (18%)</option>
                                <option value="normal">No GST</option>
                                <option value="inclusive">GST Included (back calculate)</option>
                            </select>
                        </label>

                        <div className="gst-create-summary" aria-live="polite">
                            <div><span>Base Amount</span><strong>₹{formatAmount(amounts.baseAmount)}</strong></div>
                            {gstType === "igst" ? (
                                <div><span>IGST (18%)</span><strong>₹{formatAmount(amounts.igst)}</strong></div>
                            ) : gstType === "exclusive" || gstType === "inclusive" ? (
                                <>
                                    <div><span>CGST (9%)</span><strong>₹{formatAmount(amounts.cgst)}</strong></div>
                                    <div><span>SGST (9%)</span><strong>₹{formatAmount(amounts.sgst)}</strong></div>
                                </>
                            ) : null}
                            <div className="gst-create-total"><span>Total Invoice Amount</span><strong>₹{formatAmount(amounts.totalAmount)}</strong></div>
                        </div>

                        <label className="gst-create-field">
                            <span>Invoice Date</span>
                            <input
                                type="date"
                                value={invoiceDate}
                                max={today()}
                                onChange={(event) => setInvoiceDate(event.target.value)}
                                required
                            />
                        </label>

                        <label className="gst-create-field">
                            <span>Comments</span>
                            <textarea
                                value={comments}
                                onChange={(event) => setComments(event.target.value)}
                                maxLength={2000}
                                rows={3}
                                placeholder="Optional invoice comments"
                            />
                        </label>

                        <div className="gst-create-actions">
                            <button type="button" className="gst-create-secondary" onClick={() => navigate("/accounts/generate-invoice")} disabled={saving}>
                                Cancel
                            </button>
                            <button type="submit" className="gst-create-submit" disabled={saving}>
                                {saving ? "Generating…" : "Generate Invoice"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default CreateGstInvoice;
