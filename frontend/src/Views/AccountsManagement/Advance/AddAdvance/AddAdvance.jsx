import { useEffect, useState } from "react";
import advanceService from "../../../../services/advanceService";
import "./AddAdvance.css";

const getToday = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
};

const initialForm = {
    employeeId: "",
    advance: "",
    advanceDate: getToday(),
    remark: "",
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(Number(value) || 0);

const AddAdvance = () => {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        let active = true;

        const loadEmployees = async () => {
            try {
                const data = await advanceService.getEligibleEmployees();
                if (active) {
                    setEmployees(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (active) {
                    setMessage({
                        type: "error",
                        text: error.message || "Could not load employees.",
                    });
                }
            } finally {
                if (active) setLoadingEmployees(false);
            }
        };

        loadEmployees();

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setMessage(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            await advanceService.createAdvance({
                employeeId: Number(form.employeeId),
                advance: Number(form.advance),
                advanceDate: form.advanceDate,
                remark: form.remark,
            });

            setMessage({
                type: "success",
                text: "Advance added successfully.",
            });
            setForm({ ...initialForm, advanceDate: getToday() });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Could not add employee advance.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="main-content">
            <section className="">
                <div className="reg-w3 add-advance-page">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">💰</span>
                                <div>
                                    <h2>Add Employee Advance</h2>
                                    <p>Add advance payment details</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            {message && (
                                <div
                                    className={`advance-message advance-message-${message.type}`}
                                    role="alert"
                                >
                                    {message.text}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="employeeId">
                                    Select Employee <span>*</span>
                                </label>
                                <select
                                    id="employeeId"
                                    name="employeeId"
                                    className="employee-select"
                                    value={form.employeeId}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingEmployees}
                                >
                                    <option value="">
                                        {loadingEmployees
                                            ? "Loading employees..."
                                            : "-- Select Employee --"}
                                    </option>

                                    {employees.map((employee) => (
                                        <option
                                            key={employee.employeeId}
                                            value={employee.employeeId}
                                        >
                                            {employee.employeeName} (Salary:{" "}
                                            {formatCurrency(employee.packageAmount)})
                                        </option>
                                    ))}
                                </select>

                                {!loadingEmployees && employees.length === 0 && (
                                    <small className="advance-no-employees">
                                        No active employees found.
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="advance">
                                    Advance Amount <span>*</span>
                                </label>
                                <input
                                    id="advance"
                                    type="number"
                                    name="advance"
                                    placeholder="Enter Advance Amount"
                                    step="0.01"
                                    min="0.01"
                                    max="99999999.99"
                                    value={form.advance}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="advanceDate">
                                    Advance Date <span>*</span>
                                </label>
                                <input
                                    id="advanceDate"
                                    type="date"
                                    name="advanceDate"
                                    value={form.advanceDate}
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="remark">Advance Remark</label>
                                <textarea
                                    id="remark"
                                    name="remark"
                                    placeholder="Enter remark"
                                    rows="4"
                                    value={form.remark}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={submitting || loadingEmployees}
                            >
                                <span>💰</span>
                                {submitting ? "Saving..." : "Save Advance"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default AddAdvance;