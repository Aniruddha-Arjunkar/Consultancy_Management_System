import { useEffect, useMemo, useRef, useState } from "react";
import salaryService from "../../../services/salaryService";


const getCurrentMonth = () => {
    const today = new Date();

    return `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}`;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(Number(value) || 0);
};

const Salary = () => {
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    const advanceWasEdited = useRef(false);

    const [form, setForm] = useState({
        employeeId: "",
        month: getCurrentMonth(),
        paymentType: "",
        stipendAmount: "",
        performanceIncentive: "0",
        professionTax: "0",
        advanceDeduction: "",
        expenseReimbursement: "0",
    });

    useEffect(() => {
        let isCurrentRequest = true;

        const loadEmployees = async () => {
            try {
                const data = await salaryService.getEligibleEmployees();

                if (isCurrentRequest) {
                    setEmployees(data);
                }
            } catch (error) {
                if (isCurrentRequest) {
                    window.alert(
                        error.message || "Unable to load employees ❌."
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setLoadingEmployees(false);
                }
            }
        };

        loadEmployees();

        return () => {
            isCurrentRequest = false;
        };
    }, []);

    const selectedEmployee = employees.find(
        (employee) =>
            String(employee.employeeId) === String(form.employeeId)
    );

    const payload = useMemo(() => {
        if (!form.employeeId || !form.month || !form.paymentType) {
            return null;
        }

        const numberOrZero = (value) =>
            value === "" || value == null ? 0 : Number(value);

        return {
            employeeId: Number(form.employeeId),
            month: form.month,
            paymentType: form.paymentType,
            stipendAmount: numberOrZero(form.stipendAmount),
            performanceIncentive: numberOrZero(
                form.performanceIncentive
            ),
            professionTax: numberOrZero(form.professionTax),
            advanceDeduction: numberOrZero(form.advanceDeduction),
            expenseReimbursement: numberOrZero(
                form.expenseReimbursement
            ),
        };
    }, [form]);

    useEffect(() => {
        if (!payload) {
            setPreview(null);
            return undefined;
        }

        let isCurrentRequest = true;

        const timer = window.setTimeout(async () => {
            setLoadingPreview(true);

            try {
                const data = await salaryService.previewSalary(payload);

                if (isCurrentRequest) {
                    setPreview(data);

                    if (
                        !advanceWasEdited.current &&
                        (form.paymentType === "Salary" ||
                            form.paymentType === "PerDay")
                    ) {
                        setForm((current) => ({
                            ...current,
                            advanceDeduction: String(
                                data.pendingAdvance || 0
                            ),
                        }));
                    }
                }
            } catch (error) {
                if (isCurrentRequest) {
                    setPreview(null);
                    window.alert(
                        error.message || "Unable to calculate salary ❌."
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setLoadingPreview(false);
                }
            }
        }, 300);

        return () => {
            isCurrentRequest = false;
            window.clearTimeout(timer);
        };
    }, [payload, form.paymentType]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "advanceDeduction") {
            advanceWasEdited.current = true;
        }

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleEmployeeChange = (event) => {
        const employeeId = event.target.value;
        const employee = employees.find(
            (item) => String(item.employeeId) === employeeId
        );

        advanceWasEdited.current = false;
        setPreview(null);

        setForm((current) => ({
            ...current,
            employeeId,
            stipendAmount: employee
                ? String(employee.packageAmount ?? 0)
                : "",
            advanceDeduction: "",
        }));
    };

    const handlePaymentTypeChange = (event) => {
        advanceWasEdited.current = false;
        setPreview(null);

        setForm((current) => ({
            ...current,
            paymentType: event.target.value,
            advanceDeduction: "",
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!payload) {
            window.alert("Select an employee, month, and payment type  ⚠️.");
            return;
        }

        try {
            setSaving(true);

            const result = await salaryService.createSalary(payload);

            window.alert(
                result.message || "Salary payment recorded successfully ✅."
            );

            setPreview(null);
            advanceWasEdited.current = false;

            setForm((current) => ({
                ...current,
                employeeId: "",
                paymentType: "",
                stipendAmount: "",
                performanceIncentive: "0",
                professionTax: "0",
                advanceDeduction: "",
                expenseReimbursement: "0",
            }));
        } catch (error) {
            window.alert(error.message || "Unable to save salary payment ❌.");
        } finally {
            setSaving(false);
        }
    };

    const amountInput = (
        label,
        name,
        value,
        onChange = handleChange,
        readOnly = false
    ) => (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                name={name}
                type="number"
                min="0"
                step="0.01"
                value={value ?? ""}
                onChange={onChange}
                readOnly={readOnly}
            />
        </div>
    );

    return (
        <div className="reg-w3">
            <div className="refollowup-card">
                <div className="refollowup-header">
                    <div className="refollowup-title">
                        <span className="phone-icon">💰</span>

                        <div>
                            <h2>Add Payment</h2>
                            <p>Add employee salary and payment details</p>
                        </div>
                    </div>
                </div>

                <form className="refollowup-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="employeeId">
                                Select Employee <span>*</span>
                            </label>

                            <select
                                id="employeeId"
                                name="employeeId"
                                value={form.employeeId}
                                onChange={handleEmployeeChange}
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
                                        {formatCurrency(
                                            employee.packageAmount
                                        )}
                                        )
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="month">
                                Select Month <span>*</span>
                            </label>
                            <input
                                id="month"
                                name="month"
                                type="month"
                                value={form.month}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="paymentType">
                                Payment Type <span>*</span>
                            </label>
                            <select
                                id="paymentType"
                                name="paymentType"
                                value={form.paymentType}
                                onChange={handlePaymentTypeChange}
                                required
                            >
                                <option value="">-- Select Type --</option>
                                <option value="Salary">Salary</option>
                                <option value="Stipend">Stipend</option>
                                <option value="PerDay">Per Day</option>
                            </select>
                        </div>
                    </div>

                    {form.paymentType === "Stipend" && (
                        <div id="stipend_section">
                            <div className="form-row">
                                {amountInput(
                                    "Stipend Amount",
                                    "stipendAmount",
                                    form.stipendAmount
                                )}
                            </div>
                        </div>
                    )}

                    {form.paymentType === "Salary" && (
                        <div id="salary_section">
                            <div className="form-row">
                                {amountInput(
                                    "Monthly Package",
                                    "monthlyPackage",
                                    preview?.grossAmount ??
                                        selectedEmployee?.packageAmount ??
                                        "",
                                    undefined,
                                    true
                                )}
                            </div>

                            <div className="form-row">
                                {amountInput(
                                    "Basic (50%)",
                                    "basic",
                                    preview?.basic,
                                    undefined,
                                    true
                                )}
                                {amountInput(
                                    "HRA (20%)",
                                    "hra",
                                    preview?.hra,
                                    undefined,
                                    true
                                )}
                            </div>

                            <div className="form-row">
                                {amountInput(
                                    "Conveyance (10%)",
                                    "conveyance",
                                    preview?.conveyance,
                                    undefined,
                                    true
                                )}
                                {amountInput(
                                    "Food Allowance (20%)",
                                    "foodAllowance",
                                    preview?.foodAllowance,
                                    undefined,
                                    true
                                )}
                            </div>

                            <div className="form-row">
                                {amountInput(
                                    "Performance Incentive (Manual)",
                                    "performanceIncentive",
                                    form.performanceIncentive
                                )}
                                {amountInput(
                                    "Profession Tax (Manual)",
                                    "professionTax",
                                    form.professionTax
                                )}
                            </div>

                            <div className="form-row">
                                {amountInput(
                                    "Expense Reimbursement",
                                    "expenseReimbursement",
                                    form.expenseReimbursement
                                )}
                                {amountInput(
                                    `Advance Deduction (Pending: ${formatCurrency(
                                        preview?.pendingAdvance
                                    )})`,
                                    "advanceDeduction",
                                    form.advanceDeduction
                                )}
                            </div>
                        </div>
                    )}

                    {form.paymentType === "PerDay" && (
                        <div id="perday_section">
                            <div className="form-row">
                                {amountInput(
                                    "Number of Paid Days",
                                    "paidDays",
                                    preview?.paidDays,
                                    undefined,
                                    true
                                )}
                                {amountInput(
                                    "Rate Per Day",
                                    "ratePerDay",
                                    preview?.ratePerDay,
                                    undefined,
                                    true
                                )}
                            </div>

                            <div className="form-row">
                                {amountInput(
                                    "Performance Incentive (Manual)",
                                    "performanceIncentive",
                                    form.performanceIncentive
                                )}
                                {amountInput(
                                    "Profession Tax (Manual)",
                                    "professionTax",
                                    form.professionTax
                                )}
                            </div>

                            <div className="form-row">
                                {amountInput(
                                    "Expense Reimbursement",
                                    "expenseReimbursement",
                                    form.expenseReimbursement
                                )}
                                {amountInput(
                                    `Advance Deduction (Pending: ${formatCurrency(
                                        preview?.pendingAdvance
                                    )})`,
                                    "advanceDeduction",
                                    form.advanceDeduction
                                )}
                            </div>
                        </div>
                    )}

                    {preview && (
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label htmlFor="netPayable">Net Payable</label>
                                <input
                                    id="netPayable"
                                    type="text"
                                    value={formatCurrency(preview.netPayable)}
                                    readOnly
                                />
                                {/* {loadingPreview && (
                                    <small>Updating calculation…</small>
                                )} */}
                            </div>
                        </div>
                    )}

                    {loadingPreview && !preview && (
                        <p>Calculating payment...</p>
                    )}

                    <div className="form-row">
                        <div className="form-group full-width">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={saving || !payload}
                            >
                                <span>💰</span>
                                {saving ? "Saving..." : "Save Payment"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Salary;