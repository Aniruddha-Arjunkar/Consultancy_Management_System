import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import paymentService from "../../../../../services/paymentService";
import "./UpdateDuePayment.css";

const GATEWAYS = ["Cash", "UPI", "NEFT", "Cheque", "IMPS"];

const emptyForm = {
    paidAmount: "",
    applyTds: false,
    tdsAmount: "0",
    tdsPaid: false,
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
                    paidAmount:"0.00",
                    applyTds: Number(data.tdsAmount || 0) > 0,
                    tdsAmount: data.tdsAmount ?? "0.00",
                    tdsPaid: Boolean(data.tdsPaid),
                    paymentDate:
                        data.paymentDate ||
                        new Date().toISOString().slice(0, 10),
                    dueDate: data.due || "",
                    paymentGateway: isKnownGateway
                        ? savedGateway
                        : savedGateway
                            ? "Other"
                            : "",
                    otherGateway: isKnownGateway ? "" : savedGateway,
                });
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load payment details."
                    );
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

    // const handleSubmit = async (event) => {
    //     event.preventDefault();
    //     if (!payment || saving) return;

    //     const gateway =
    //         form.paymentGateway === "Other"
    //             ? form.otherGateway.trim()
    //             : form.paymentGateway;

    //     if (!gateway) {
    //         setError("Select or enter a payment gateway.");
    //         return;
    //     }

    //     setSaving(true);
    //     setError("");

    //     try {
    //         await paymentService.updatePayment(paymentId, {
    //             paidAmount: Number(form.paidAmount),
    //             paymentDate: form.paymentDate,
    //             dueDate: form.dueDate || null,
    //             paymentGateway: gateway,
    //             tdsAmount: form.applyTds
    //                 ? Number(form.tdsAmount || 0)
    //                 : 0,
    //             tdsPaid: form.applyTds && form.tdsPaid,
    //         });

    //         window.alert("Payment details updated successfully.");
    //         navigate("/accounts/due-payment");
    //     } catch (saveError) {
    //         setError(
    //             saveError.message || "Could not update payment details."
    //         );
    //     } finally {
    //         setSaving(false);
    //     }
    // };

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

        const confirmed = window.confirm(
            `Please confirm the payment details:\n\n` +
            `Paid Amount: ₹${formatAmount(form.paidAmount)}\n` +
            `Payment Date: ${form.paymentDate || "Not selected"}\n` +
            `Payment Gateway: ${gateway}\n\n` +
            `Click OK to save or Cancel to edit.`
        );

        if (!confirmed) return;

        setSaving(true);
        setError("");

        try {
            await paymentService.updatePayment(paymentId, {
                paidAmount: Number(form.paidAmount),
                paymentDate: form.paymentDate,
                dueDate: form.dueDate || null,
                paymentGateway: gateway,
                tdsAmount: form.applyTds
                    ? Number(form.tdsAmount || 0)
                    : 0,
                tdsPaid: form.applyTds && form.tdsPaid,
            });

            window.alert("Payment details updated successfully.");
            navigate("/accounts/due-payment");
        } catch (saveError) {
            setError(saveError.message || "Could not update payment details.");
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
                        onClick={() => navigate("/accounts/due-payment")}
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
                                    value={`₹${formatAmount(payment.dueAmount)}`}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label>Paid Amount (cumulative)</label>
                                <input
                                    type="number"
                                    name="paidAmount"
                                    min="0"
                                    max={payment.totalAmount}
                                    step="0.01"
                                    value={form.paidAmount}
                                    onChange={updateField}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="applyTds"
                                        checked={form.applyTds}
                                        onChange={updateField}
                                    />
                                    Apply TDS
                                </label>
                            </div>

                            {form.applyTds && (
                                <>
                                    <div className="form-group">
                                        <label>TDS Amount</label>
                                        <input
                                            type="number"
                                            name="tdsAmount"
                                            min="0"
                                            step="0.01"
                                            value={form.tdsAmount}
                                            onChange={updateField}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="tdsPaid"
                                                checked={form.tdsPaid}
                                                onChange={updateField}
                                                disabled={
                                                    Number(form.tdsAmount) <= 0
                                                }
                                            />
                                            Mark TDS Paid
                                        </label>
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