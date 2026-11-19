import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import paymentService from "../../../../../services/paymentService";
import "./UpdateDuePayment.css";

const GATEWAYS = ["Cash", "UPI", "NEFT", "Cheque", "IMPS"];

const emptyForm = {
    paymentAmount: "",
    applyTds: false,
    tdsAmount: "0",
    paymentDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    paymentGateway: "",
    otherGateway: "",
};

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const UpdateDuePayment = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();

    const [payment, setPayment] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    const location = useLocation();
    const returnTo = location.state?.returnTo || "/accounts/due-payment";

    const isCompanyPay = payment?.paymentType?.trim().toLowerCase() === "company pay";
    const previewTdsAmount = isCompanyPay && form.applyTds
        ? Number(form.tdsAmount || 0)
        : 0;
    const previewDue = Math.max(
        Number(payment?.totalAmount || 0)
            - Number(payment?.paidAmount || 0)
            - previewTdsAmount,
        0
    );

    useEffect(() => {
        let active = true;

        const loadPayment = async () => {
            try {
                const data = await paymentService.getPayment(paymentId);
                if (!active) return;

                const savedGateway = data.paymentGateway || "";
                const isKnownGateway = GATEWAYS.includes(savedGateway);

                setPayment(data);
                setForm({
                    // Each visit records a new installment, so don't prefill a cumulative amount.
                    paymentAmount: "",
                    applyTds:
                        data.paymentType?.trim().toLowerCase() === "company pay" &&
                        Number(data.tdsAmount || 0) > 0,
                    tdsAmount: data.tdsAmount ?? "0.00",

                    // Use today's date for this installment instead of the previous installment's date.
                    paymentDate: new Date().toISOString().slice(0, 10),

                    // The API property is dueDate.
                    dueDate: data.dueDate || "",

                    paymentGateway: isKnownGateway
                        ? savedGateway
                        : savedGateway
                            ? "Other"
                            : "",
                    otherGateway: isKnownGateway ? "" : savedGateway,
                });
            } catch (loadError) {
                if (active) {
                    setError(loadError.message || "Could not load payment details.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };
        loadPayment();
        return () => {
            active = false;
        };
    }, [paymentId]);

    const updateField = (event) => {
        const { name, value, checked, type } = event.target;
        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!payment || saving) return;

        const gateway =
            form.paymentGateway === "Other"
                ? form.otherGateway.trim()
                : form.paymentGateway;

        if (!gateway) {
            setError("Select or enter a payment gateway.");
            return;
        }

        const paymentAmount = Number(form.paymentAmount);
        const currentDue = previewDue;
        const previousPaid = Number(payment.paidAmount || 0);
        const tdsAmount = previewTdsAmount;

        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            setError("Enter a payment amount greater than zero.");
            return;
        }

        if (paymentAmount > currentDue) {
            setError("Payment amount cannot exceed the current due amount.");
            return;
        }

        const maxTdsAmount = Number(payment.maxTdsAmount || 0);

        if (!Number.isFinite(tdsAmount) || tdsAmount < 0) {
            setError("Enter a valid TDS amount.");
            return;
        }

        if (tdsAmount > maxTdsAmount) {
            setError(
                `TDS amount cannot exceed the applicable GST amount of ₹${formatAmount(maxTdsAmount)}.`
            );
            return;
        }

        const newPaidTotal = previousPaid + paymentAmount;
        const remainingDue = Math.max(currentDue - paymentAmount, 0);

        const confirmed = window.confirm(
            `Confirm this installment:\n\n` +
            `Payment Amount: ₹${formatAmount(paymentAmount)}\n` +
            `Previously Paid: ₹${formatAmount(previousPaid)}\n` +
            `Paid Total After Payment: ₹${formatAmount(newPaidTotal)}\n` +
            `Due After Payment: ₹${formatAmount(remainingDue)}\n` +
            `Payment Date: ${form.paymentDate}\n` +
            `Payment Gateway: ${gateway}\n\n` +
            `Click OK to save or Cancel to edit.`
        );

        if (!confirmed) return;

        setSaving(true);
        setError("");

        try {
            await paymentService.updatePayment(paymentId, {
                paymentAmount,
                paymentDate: form.paymentDate,
                dueDate: form.dueDate || null,
                paymentGateway: gateway,
                tdsAmount: isCompanyPay && form.applyTds
                    ? Number(form.tdsAmount || 0)
                    : 0,
                tdsPaid: Boolean(payment.tdsPaid),
            });
            window.alert("Payment installment recorded successfully.");
            navigate(returnTo, { replace: true });
        } catch (saveError) {
            setError(saveError.message || "Could not record this payment.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading payment details...</p>
                </section>
            </section>
        );
    }

    if (error && !payment) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p role="alert">{error}</p>
                    <button
                        type="button"
                        onClick={() => navigate(returnTo)}
                    >
                        Back to Due Payments
                    </button>
                </section>
            </section>
        );
    }

    if (!payment) return null;

    return (
        <section id="main-content">
            <section className="">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">💳</span>
                                <div>
                                    <h2>Update Due Payment</h2>
                                    <p>Add and update payment details</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            {error && <p role="alert">{error}</p>}

                            <div className="form-group">
                                <label>Due Amount</label>
                                <input
                                    type="text"
                                    value={`₹${formatAmount(previewDue)}`}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label>Payment Amount</label>
                                <input
                                    type="number"
                                    name="paymentAmount"
                                    min="0.01"
                                    max={previewDue}
                                    step="0.01"
                                    value={form.paymentAmount}
                                    onChange={updateField}
                                    placeholder="Enter payment amount"
                                    required
                                />
                            </div>

                            {isCompanyPay && (
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="applyTds"
                                            checked={form.applyTds}
                                            onChange={updateField}
                                            disabled={Boolean(payment.tdsPaid)}
                                        />
                                        Apply TDS
                                    </label>
                                </div>
                            )}

                            {isCompanyPay && form.applyTds && (
                                <>
                                    <div className="form-group">
                                        <label>TDS Amount</label>
                                        <input
                                            type="number"
                                            name="tdsAmount"
                                            min="0"
                                            max={payment.maxTdsAmount}
                                            step="0.01"
                                            value={form.tdsAmount}
                                            onChange={updateField}
                                            readOnly={Boolean(payment.tdsPaid)}
                                        />
                                        <small>
                                            {payment.tdsPaid
                                                ? "TDS is marked paid. Manage its remittance in the TDS module."
                                                : `Maximum TDS allowed: ₹${formatAmount(payment.maxTdsAmount)}`}
                                        </small>
                                    </div>

                                </>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Payment Date</label>
                                    <input
                                        type="date"
                                        name="paymentDate"
                                        value={form.paymentDate}
                                        onChange={updateField}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={form.dueDate}
                                        onChange={updateField}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Payment Gateway</label>
                                <select
                                    name="paymentGateway"
                                    value={form.paymentGateway}
                                    onChange={updateField}
                                    required
                                >
                                    <option value="">
                                        Select Payment Gateway
                                    </option>
                                    {GATEWAYS.map((gateway) => (
                                        <option key={gateway} value={gateway}>
                                            {gateway}
                                        </option>
                                    ))}
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {form.paymentGateway === "Other" && (
                                <div className="form-group">
                                    <label htmlFor="otherGateway">
                                        Enter Payment Gateway
                                    </label>
                                    <input
                                        type="text"
                                        id="otherGateway"
                                        name="otherGateway"
                                        value={form.otherGateway}
                                        onChange={updateField}
                                        maxLength={255}
                                        placeholder="Enter gateway name"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Payment Type</label>
                                    <input
                                        type="text"
                                        value={payment.paymentType || ""}
                                        readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Interview ID</label>
                                    <input
                                        type="text"
                                        value={payment.interviewId || ""}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "💳 Submit"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default UpdateDuePayment;
