import { useEffect, useMemo, useState } from "react";
import expenseService from "../../../../services/expenseService";
import "./ViewExpenses.css";

const formatAmount = (value) => {
    const amount = Number.parseFloat(value);
    if (!Number.isFinite(amount)) return "0.00";

    return amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[character];
    });

const ViewExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [appliedFromDate, setAppliedFromDate] = useState("");
    const [appliedEndDate, setAppliedEndDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadExpenses = async (from = "", end = "") => {
        setLoading(true);
        setError("");

        try {
            const data = await expenseService.getExpenses(from, end);
            setExpenses(Array.isArray(data) ? data : []);
        } catch (loadError) {
            setError(loadError.message || "Could not load expenses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpenses();
    }, []);

    const filteredExpenses = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return expenses;

        return expenses.filter((expense) =>
            [
                expense.branch,
                expense.expenses,
                expense.services,
                expense.date,
                expense.paymentGateway,
                expense.amount,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [expenses, search]);

    const total = filteredExpenses.reduce((sum, expense) => {
        const amount = Number.parseFloat(expense.amount);
        return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    const handleDateSearch = () => {
        if (Boolean(fromDate) !== Boolean(endDate)) {
            setError("Select both a start date and an end date.");
            return;
        }

        if (fromDate && endDate && fromDate > endDate) {
            setError("The start date must be on or before the end date.");
            return;
        }

        setAppliedFromDate(fromDate);
        setAppliedEndDate(endDate);
        loadExpenses(fromDate, endDate);
    };

    const printExpenses = () => {
        const printWindow = window.open(
            "",
            "_blank",
            "width=1200,height=800"
        );

        if (!printWindow) {
            window.alert("Allow pop-ups to print the expense report.");
            return;
        }

        const rows = filteredExpenses
            .map(
                (expense, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${escapeHtml(expense.branch)}</td>
                        <td>${escapeHtml(expense.expenses)}</td>
                        <td>${escapeHtml(expense.services)}</td>
                        <td>${escapeHtml(expense.date)}</td>
                        <td>${escapeHtml(expense.paymentGateway)}</td>
                        <td>${formatAmount(expense.amount)}</td>
                    </tr>`
            )
            .join("");

        printWindow.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Expenses Report</title>
                <style>
                    * { box-sizing: border-box; }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 10mm;
                        color: #000;
                    }
                    h2 {
                        text-align: center;
                        margin: 0 0 15px;
                        font-size: 22px;
                    }
                    .expense-print-table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                    }
                    .expense-print-table th,
                    .expense-print-table td {
                        border: 1px solid #000;
                        padding: 8px 6px;
                        text-align: center;
                        vertical-align: middle;
                        font-size: 14px;
                        line-height: 1.3;
                        overflow-wrap: break-word;
                    }
                    .expense-print-table th {
                        background: #1149cc !important;
                        color: #fff !important;
                        font-weight: 700;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .print-total {
                        margin-top: 12px;
                        display: flex;
                        justify-content: flex-end;
                        break-inside: avoid;
                    }
                    .print-total-label,
                    .print-total-amount {
                        background: #1149cc !important;
                        color: #fff !important;
                        border: 1px solid #000;
                        padding: 7px 15px;
                        font-weight: 700;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    @media print {
                        body { margin: 8mm; }
                        thead { display: table-header-group; }
                        tr { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h2>Expenses Report</h2>
                <table class="expense-print-table">
                    <thead>
                        <tr>
                            <th>Sr No</th>
                            <th>Branch</th>
                            <th>Expenses</th>
                            <th>Services</th>
                            <th>Paid Date</th>
                            <th>Gateway</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="7">No record found.</td></tr>'}
                    </tbody>
                </table>
                <div class="print-total">
                    <div class="print-total-label">Total</div>
                    <div class="print-total-amount">INR ${formatAmount(total)}</div>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    return (
        <section id="main-content">
            <div className="view-clients-page view-expenses-page">
                <div className="view-clients-card">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h2 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    💰
                                </span>
                                View Expenses
                            </h2>
                        </div>
                    </div>

                    <div className="view-clients-filter">
                        <div className="view-client-search-wrap">
                            <span className="view-client-search-icon">🔍</span>
                            <input
                                type="text"
                                className="view-client-search"
                                placeholder="Search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                aria-label="Search expenses"
                            />
                        </div>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(event) =>
                                setFromDate(event.target.value)
                            }
                            className="view-client-date"
                            aria-label="From date"
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(event) =>
                                setEndDate(event.target.value)
                            }
                            className="view-client-date"
                            aria-label="End date"
                        />

                        <button
                            type="button"
                            onClick={handleDateSearch}
                            className="view-client-search-btn"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={printExpenses}
                            className="view-client-search-btn"
                        >
                            Print
                        </button>
                    </div>

                    {error && (
                        <p className="view-expenses-error" role="alert">
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <p>Loading expenses...</p>
                    ) : (
                        <div className="view-clients-table-wrapper">
                            <table
                                className="view-clients-table"
                                id="expenses"
                            >
                                <thead>
                                    <tr>
                                        <th>Sr No</th>
                                        <th>Branch</th>
                                        <th>Expenses</th>
                                        <th>Services</th>
                                        <th>Paid Date</th>
                                        <th>Gateway</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredExpenses.length > 0 ? (
                                        filteredExpenses.map((expense, index) => (
                                            <tr key={expense.id}>
                                                <td className="view-client-sr">
                                                    {index + 1}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`view-client-branch branch-${String(
                                                            expense.branch || ""
                                                        )
                                                            .toLowerCase()
                                                            .replace(/\s+/g, "-")}`}
                                                    >
                                                        {expense.branch}
                                                    </span>
                                                </td>
                                                <td className="view-client-name">
                                                    {expense.expenses}
                                                </td>
                                                <td className="view-client-service">
                                                    {expense.services}
                                                </td>
                                                <td className="view-client-date-cell">
                                                    {expense.date}
                                                </td>
                                                <td>{expense.paymentGateway}</td>
                                                <td>{formatAmount(expense.amount)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="view-client-no-data"
                                            >
                                                No record found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                <tfoot>
                                    <tr>
                                        <th colSpan={6}>Total</th>
                                        <th id="total-amount">
                                            INR {formatAmount(total)}
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ViewExpenses;