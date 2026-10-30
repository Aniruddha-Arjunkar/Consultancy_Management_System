import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import interviewScheduleService from "../../../../services/interviewScheduleService";
import "./AddPaymentInfo.css";

const emptyForm = {
    salaryPackage: "",
    joiningDate: "",
    paymentType: "",
    companyPayAmount: "",
    companyPayDate: "",
    companyGstApplicable: false,
    candidatePayAmount: "",
    candidatePayDate: "",
    candidateGstApplicable: false,
};

const calculateGST = (amount, applicable) => {
    const base = Number(amount) || 0;
    const gst = applicable ? Math.round((base * 0.18 + Number.EPSILON) * 100) / 100 : 0;
    return { gst, total: Math.round((base + gst + Number.EPSILON) * 100) / 100 };
};

const formatAmount = (amount) => Number(amount).toFixed(2);

const AddPaymentInfo = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [current, setCurrent] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadInterview = async () => {
            try {
                const data = await interviewScheduleService.getInterviewForUpdate(interviewId);
                if (!active) return;

                setCurrent(data.current);
                if (data.current.interviewStatus !== "Placed") {
                    setError("Payment details can only be entered for a placed candidate.");
                }
                setForm((previous) => ({
                    ...previous,
                    salaryPackage: data.current.salaryPackage || "",
                    joiningDate: data.current.joiningDate || "",
                    paymentType: data.current.paymentType || "",
                    companyPayAmount: data.current.companyPayAmount ?? "",
                    companyPayDate: data.current.companyPayDate || "",
                    companyGstApplicable: Number(data.current.companyGstAmount || 0) > 0,
                    candidatePayAmount: data.current.candidatePayAmount ?? "",
                    candidatePayDate: data.current.candidatePayDate || "",
                    candidateGstApplicable: Number(data.current.candidateGstAmount || 0) > 0,
                }));
            } catch (loadError) {
                if (active) setError(loadError.message || "Could not load interview details.");
            } finally {
                if (active) setLoading(false);
            }
        };

        loadInterview();
        return () => {
            active = false;
        };
    }, [interviewId]);

    const companyPays = form.paymentType === "Company Pay" || form.paymentType === "Both Pay";
    const candidatePays = form.paymentType === "Candidate Pay" || form.paymentType === "Both Pay";
    const companyTotals = useMemo(
        () => calculateGST(form.companyPayAmount, form.companyGstApplicable),
        [form.companyPayAmount, form.companyGstApplicable]
    );
    const candidateTotals = useMemo(
        () => calculateGST(form.candidatePayAmount, form.candidateGstApplicable),
        [form.candidatePayAmount, form.candidateGstApplicable]
    );

    const updateField = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (saving) return;
        setError("");

        if (!current || current.interviewStatus !== "Placed") {
            setError("Payment details can only be entered for a placed candidate.");
            return;
        }
        if (companyPays && form.companyPayAmount === "") {
            setError("Enter the company payment amount.");
            return;
        }
        if (candidatePays && form.candidatePayAmount === "") {
            setError("Enter the candidate payment amount.");
            return;
        }

        setSaving(true);
        try {
            await interviewScheduleService.savePlacementPayment(interviewId, {
                salaryPackage: form.salaryPackage.trim(),
                joiningDate: form.joiningDate,
                paymentType: form.paymentType,
                companyPayAmount: companyPays ? Number(form.companyPayAmount) : null,
                companyPayDate: companyPays && form.companyPayDate ? form.companyPayDate : null,
                companyGstApplicable: companyPays && form.companyGstApplicable,
                candidatePayAmount: candidatePays ? Number(form.candidatePayAmount) : null,
                candidatePayDate: candidatePays && form.candidatePayDate ? form.candidatePayDate : null,
                candidateGstApplicable: candidatePays && form.candidateGstApplicable,
            });
            window.alert("Placement and payment details saved successfully.");
            navigate("/consultancy/interview-schedule");
        } catch (saveError) {
            setError(saveError.message || "Could not save placement payment details.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section id="main-content">
                <p>Loading placement details...</p>
            </section>
        );
    }

    return (
        <section id="main-content">
            <section className="">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">📞</span>
                                <div>
                                    <h2>Placement &amp; Payment Details</h2>
                                    <p>Enter candidate placement and payment details</p>
                                </div>
                            </div>
                        </div>

                        <form className="refollowup-form" onSubmit={handleSubmit}>
                            {error && <p role="alert">{error}</p>}

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="salary_package">Salary Package</label>
                                    <input
                                        type="text"
                                        id="salary_package"
                                        name="salaryPackage"
                                        placeholder="Enter salary package"
                                        value={form.salaryPackage}
                                        onChange={updateField}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="joining_date">Joining Date</label>
                                    <input
                                        type="date"
                                        id="joining_date"
                                        name="joiningDate"
                                        value={form.joiningDate}
                                        onChange={updateField}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="payment_type">Payment Type</label>
                                    <select
                                        name="paymentType"
                                        id="payment_type"
                                        value={form.paymentType}
                                        onChange={updateField}
                                        required
                                    >
                                        <option value="">Select Pay</option>
                                        <option value="Company Pay">Company Pay</option>
                                        <option value="Candidate Pay">Candidate Pay</option>
                                        <option value="Both Pay">Both Pay</option>
                                    </select>
                                </div>
                            </div>

                            <div id="company_pay_fields" className="form-row" style={{ display: companyPays ? "grid" : "none" }}>
                                <div className="form-group">
                                    <label htmlFor="company_pay_amount">Company Pay Amount (Base)</label>
                                    <input
                                        type="number"
                                        id="company_pay_amount"
                                        name="companyPayAmount"
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter company amount"
                                        value={form.companyPayAmount}
                                        onChange={updateField}
                                        required={companyPays}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="company_pay_date">Company Pay Date</label>
                                    <input
                                        type="date"
                                        id="company_pay_date"
                                        name="companyPayDate"
                                        value={form.companyPayDate}
                                        onChange={updateField}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label style={{display:'flex' , flexDirection:'row'}}>
                                        <input
                                            type="checkbox"
                                            name="companyGstApplicable"
                                            id="company_gst_applicable"
                                            checked={form.companyGstApplicable}
                                            onChange={updateField}
                                        />
                                        Apply GST (18%)
                                    </label>
                                </div>
                                {form.companyGstApplicable && Number(form.companyPayAmount) > 0 && (
                                    <div id="company_gst_details" className="form-group full-width">
                                        <div>GST Amount: ₹<span id="company_gst_value">{formatAmount(companyTotals.gst)}</span></div>
                                        <div>Total with GST: ₹<span id="company_total_value">{formatAmount(companyTotals.total)}</span></div>
                                    </div>
                                )}
                            </div>

                            <div id="candidate_pay_fields" className="form-row" style={{ display: candidatePays ? "grid" : "none" }}>
                                <div className="form-group">
                                    <label htmlFor="candidate_pay_amount">Candidate Pay Amount (Base)</label>
                                    <input
                                        type="number"
                                        id="candidate_pay_amount"
                                        name="candidatePayAmount"
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter candidate amount"
                                        value={form.candidatePayAmount}
                                        onChange={updateField}
                                        required={candidatePays}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="candidate_pay_date">Candidate Pay Date</label>
                                    <input
                                        type="date"
                                        id="candidate_pay_date"
                                        name="candidatePayDate"
                                        value={form.candidatePayDate}
                                        onChange={updateField}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="candidateGstApplicable"
                                            id="candidate_gst_applicable"
                                            checked={form.candidateGstApplicable}
                                            onChange={updateField}
                                        />
                                        Apply GST (18%)
                                    </label>
                                </div>
                                {form.candidateGstApplicable && Number(form.candidatePayAmount) > 0 && (
                                    <div id="candidate_gst_details" className="form-group full-width">
                                        <div>GST Amount: ₹<span id="candidate_gst_value">{formatAmount(candidateTotals.gst)}</span></div>
                                        <div>Total with GST: ₹<span id="candidate_total_value">{formatAmount(candidateTotals.total)}</span></div>
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <button type="submit" className="submit-btn" disabled={saving || current?.interviewStatus !== "Placed"}>
                                        {saving ? "Saving..." : "📞 Update Placement Details"}
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

export default AddPaymentInfo;
