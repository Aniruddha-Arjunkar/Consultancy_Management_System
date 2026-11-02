import { useState } from "react";
import expenseService from "./../../../../services/expenseService";
import "./AddExpenses.css";

const getToday = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
};

const initialForm = {
    branch: "",
    services: "",
    expenses: "",
    amount: "",
    date: getToday(),
    paymentGateway: "",
};

const AddExpenses = () => {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            await expenseService.createExpense({
                ...form,
                amount: Number(form.amount),
            });

            window.alert("Expense added successfully ✅.");
            setForm({ ...initialForm, date: getToday() });
        } catch (submitError) {
            setError(submitError.message || "Could not add the expense.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="main-content">
            <section className="">
                <div className="reg-w3 expense-page">
                    <div className="expense-card">
                        <div className="expense-header">
                            <div className="expense-title">
                                <span className="expense-icon">💰</span>
                                <div>
                                    <h2>Add Expenses</h2>
                                    <p>Add and manage your expense details</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="expense-form"
                            onSubmit={handleSubmit}
                        >
                            {error && (
                                <p className="expense-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <div className="form-group">
                                <label htmlFor="branch">
                                    Branch <span>*</span>
                                </label>
                                <select
                                    id="branch"
                                    name="branch"
                                    value={form.branch}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Branch</option>
                                    <option value="Nagpur">Nagpur</option>
                                    <option value="Bramhapuri">
                                        Bramhapuri
                                    </option>
                                    <option value="Chandrapur">
                                        Chandrapur
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="services">
                                    Service <span>*</span>
                                </label>
                                <input
                                    id="services"
                                    type="text"
                                    name="services"
                                    placeholder="Enter service"
                                    value={form.services}
                                    onChange={handleChange}
                                    maxLength={255}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="expenses">
                                    Expense <span>*</span>
                                </label>
                                <input
                                    id="expenses"
                                    type="text"
                                    name="expenses"
                                    placeholder="Enter expense"
                                    value={form.expenses}
                                    onChange={handleChange}
                                    maxLength={255}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="amount">
                                        Amount <span>*</span>
                                    </label>
                                    <input
                                        id="amount"
                                        type="number"
                                        name="amount"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Enter amount"
                                        value={form.amount}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="date">
                                        Date <span>*</span>
                                    </label>
                                    <input
                                        id="date"
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="paymentGateway">
                                    Payment Gateway <span>*</span>
                                </label>
                                <select
                                    id="paymentGateway"
                                    name="paymentGateway"
                                    value={form.paymentGateway}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        -- Select Payment Gateway --
                                    </option>
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="NEFT">NEFT</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="IMPS">IMPS</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={submitting}
                            >
                                <span>💰</span>
                                {submitting ? "Submitting..." : "Submit"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default AddExpenses;