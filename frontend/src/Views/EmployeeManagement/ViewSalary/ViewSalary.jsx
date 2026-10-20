import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import salaryService from "../../../services/salaryService";
import "./ViewSalary.css";

const getCurrentMonth = () => {
    const today = new Date();

    return `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}`;
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(Number(value) || 0);

const formatMonth = (month) => {
    if (!month) return "";
    const [year, monthNumber] = month.split("-").map(Number);

    return new Date(year, monthNumber - 1, 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });
};

const numberToWords = (value) => {
    const number = Math.floor(Math.abs(Number(value) || 0));
    if (number === 0) return "Zero";

    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
        "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
        "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    ];
    const tens = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty",
        "Seventy", "Eighty", "Ninety",
    ];

    const underThousand = (amount) => {
        let words = "";

        if (amount >= 100) {
            words += `${ones[Math.floor(amount / 100)]} Hundred `;
            amount %= 100;
        }

        if (amount >= 20) {
            words += `${tens[Math.floor(amount / 10)]} `;
            amount %= 10;
        }

        if (amount > 0) words += `${ones[amount]} `;
        return words.trim();
    };

    const groups = [
        ["Crore", 10000000],
        ["Lakh", 100000],
        ["Thousand", 1000],
        ["", 1],
    ];

    let remaining = number;
    const words = [];

    groups.forEach(([label, divisor]) => {
        const group = Math.floor(remaining / divisor);
        remaining %= divisor;

        if (group > 0) {
            words.push(underThousand(group));
            if (label) words.push(label);
        }
    });

    return words.join(" ");
};

const SalaryTable = ({ record, history }) => {
    const paymentType = record.paymentType;
    const isSalary = paymentType === "Salary";
    const isPerDay = paymentType === "PerDay";
    const isStipend = paymentType === "Stipend";
    const isAdvance = paymentType === "Advance";

    const advance = Number(record.advance) || 0;
    const tax = Number(record.professionTax) || 0;
    const incentive = Number(record.performanceIncentive) || 0;
    const reimbursement = Number(record.expenseReimbursement) || 0;

    const daysInMonth = new Date(
        Number(history.month.slice(0, 4)),
        Number(history.month.slice(5, 7)),
        0
    ).getDate();

    const packageAmount = Number(history.packageAmount) || 0;
    const ratePerDay =
        history.employeeType?.toLowerCase() === "per day"
            ? packageAmount
            : packageAmount / daysInMonth;

    const baseEarnings = isSalary
        ? (Number(record.basic) || 0) +
          (Number(record.hra) || 0) +
          (Number(record.conveyance) || 0) +
          (Number(record.foodAllowance) || 0)
        : isPerDay
          ? ratePerDay * Number(history.attendanceDays || 0)
          : 0;

    const totalEarnings = isStipend
        ? Number(record.amount) || 0
        : baseEarnings + incentive + reimbursement;

    const totalDeductions = isAdvance ? 0 : tax + advance;
    const netSalary = isStipend
        ? Number(record.amount) || 0
        : isAdvance
          ? advance
          : totalEarnings - totalDeductions;

    if (isAdvance) {
        return (
            <section className="salary-record">
                <h3>Advance Payment</h3>
                <table className="salary-table">
                    <tbody>
                        <tr>
                            <th>Advance Amount</th>
                            <td>{formatCurrency(advance || record.amount)}</td>
                        </tr>
                        <tr>
                            <th>Advance Date</th>
                            <td>{record.advanceDate || "—"}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        );
    }

    if (isStipend) {
        return (
            <section className="salary-record">
                <h3>Stipend — {formatMonth(history.month)}</h3>
                <table className="salary-table">
                    <tbody>
                        <tr>
                            <th>Stipend Amount</th>
                            <td>{formatCurrency(record.amount)}</td>
                        </tr>
                        <tr>
                            <th>Amount in Words</th>
                            <td>{numberToWords(record.amount)} Rupees Only</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        );
    }

    return (
        <section className="salary-record">
            <h3>{paymentType} — {formatMonth(history.month)}</h3>
            <p className="attendance-summary">
                Paid attendance: {history.attendanceDays} days
            </p>

            <table className="salary-table">
                <thead>
                    <tr>
                        <th colSpan="2">Earnings</th>
                        <th colSpan="2">Deductions</th>
                    </tr>
                </thead>
                <tbody>
                    {isSalary ? (
                        <>
                            <tr>
                                <td>Basic</td>
                                <td>{formatCurrency(record.basic)}</td>
                                <td>{advance > 0 ? "Advance" : ""}</td>
                                <td>{advance > 0 ? formatCurrency(advance) : ""}</td>
                            </tr>
                            <tr>
                                <td>HRA</td>
                                <td>{formatCurrency(record.hra)}</td>
                                <td>{tax > 0 ? "Professional Tax" : ""}</td>
                                <td>{tax > 0 ? formatCurrency(tax) : ""}</td>
                            </tr>
                            <tr>
                                <td>Conveyance</td>
                                <td>{formatCurrency(record.conveyance)}</td>
                                <td />
                                <td />
                            </tr>
                            <tr>
                                <td>Food Allowance</td>
                                <td>{formatCurrency(record.foodAllowance)}</td>
                                <td />
                                <td />
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <td>Rate per day</td>
                            <td>{formatCurrency(ratePerDay)}</td>
                            <td>{advance > 0 ? "Advance" : ""}</td>
                            <td>{advance > 0 ? formatCurrency(advance) : ""}</td>
                        </tr>
                    )}

                    {isPerDay && (
                        <tr>
                            <th>Total (Days × Rate)</th>
                            <th>{formatCurrency(baseEarnings)}</th>
                            <td>{tax > 0 ? "Professional Tax" : ""}</td>
                            <td>{tax > 0 ? formatCurrency(tax) : ""}</td>
                        </tr>
                    )}

                    {incentive > 0 && (
                        <tr>
                            <td>Performance Incentive</td>
                            <td>{formatCurrency(incentive)}</td>
                            <td />
                            <td />
                        </tr>
                    )}

                    {reimbursement > 0 && (
                        <tr>
                            <td>Expense Reimbursement</td>
                            <td>{formatCurrency(reimbursement)}</td>
                            <td />
                            <td />
                        </tr>
                    )}

                    <tr className="salary-total-row">
                        <th>Total Earnings</th>
                        <td>{formatCurrency(totalEarnings)}</td>
                        <th>Total Deductions</th>
                        <td>{formatCurrency(totalDeductions)}</td>
                    </tr>
                    <tr className="salary-total-row">
                        <th colSpan="3">Net Salary</th>
                        <td>{formatCurrency(netSalary)}</td>
                    </tr>
                    <tr>
                        <td colSpan="4">
                            <strong>In Words:</strong>{" "}
                            {numberToWords(netSalary)} Rupees Only
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    );
};

const ViewSalary = () => {
    const { employeeId } = useParams();
    const [searchParams] = useSearchParams();
    const [month, setMonth] = useState(
        searchParams.get("month") || getCurrentMonth()
    );
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let current = true;

        const loadSalary = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await salaryService.getEmployeeSalaryHistory(
                    employeeId,
                    month
                );

                if (current) setHistory(data);
            } catch (loadError) {
                if (current) {
                    setHistory(null);
                    setError(loadError.message || "Could not load salary details.");
                }
            } finally {
                if (current) setLoading(false);
            }
        };

        loadSalary();

        return () => {
            current = false;
        };
    }, [employeeId, month]);

    const records = useMemo(() => history?.records || [], [history]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="salary-container">
                    <div className="salary-header">
                        <div>
                            <h2>Salary Details</h2>
                            {history && (
                                <p className="salary-employee-name">
                                    {history.employeeName}
                                </p>
                            )}
                        </div>

                        <Link
                            to={`/employee/view-employee-detail/${employeeId}`}
                            className="salary-back-button"
                        >
                            ← Employee Details
                        </Link>
                    </div>

                    <div className="salary-controls">
                        <label htmlFor="salary-month">Select Month:</label>
                        <input
                            id="salary-month"
                            type="month"
                            value={month}
                            onChange={(event) => setMonth(event.target.value)}
                        />

                        <button
                            type="button"
                            className="view-salary-button"
                            onClick={() => setMonth((value) => value)}
                        >
                            View Salary
                        </button>

                        <button
                            type="button"
                            className="view-advance-button"
                            disabled
                            title="Available when the Accounts module is implemented"
                        >
                            💰 View Advance
                        </button>
                    </div>

                    {loading ? (
                        <p className="salary-state">Loading salary details...</p>
                    ) : error ? (
                        <p className="salary-error">{error}</p>
                    ) : records.length === 0 ? (
                        <p className="salary-empty">
                            No salary records found for {formatMonth(month)}.
                        </p>
                    ) : (
                        records.map((record) => (
                            <SalaryTable
                                key={record.id}
                                record={record}
                                history={history}
                            />
                        ))
                    )}
                </div>
            </section>
        </section>
    );
};
export default ViewSalary;