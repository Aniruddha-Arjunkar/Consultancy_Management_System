import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "./Dashboard.css";

import agreementService from "../../services/agreementService";
import attendanceService from "../../services/attendanceService";
import currentRequirementService from "../../services/currentRequirementService";
import gstBillService from "../../services/gstBillService";
import interviewScheduleService from "../../services/interviewScheduleService";
import paymentService from "../../services/paymentService";
import tdsService from "../../services/tdsService";

const toList = (value) => Array.isArray(value) ? value : [];

const getMonthKey = (date = new Date()) =>
    String(date.getFullYear()) + "-" +
    String(date.getMonth() + 1).padStart(2, "0");

const toLocalDateKey = (date) =>
    String(date.getFullYear()) + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");

const dateKey = (value) =>
    typeof value === "string" ? value.slice(0, 10) : "";

const isInMonth = (value, month) =>
    dateKey(value).startsWith(month + "-");

const asAmount = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(asAmount(value));

const formatCount = (value) =>
    Number(value || 0).toLocaleString("en-IN");

const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);
    if (!year || !month) return monthKey;

    return new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1, 1));
};

function Dashboard() {
    const navigate = useNavigate();
    const today = new Date();
    const todayKey = toLocalDateKey(today);
    const currentMonth = getMonthKey(today);

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [dashboardData, setDashboardData] = useState(null);
    const [availableSources, setAvailableSources] = useState({});
    const [loadErrors, setLoadErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        const sources = [
            {
                key: "candidates",
                label: "candidate records",
                load: () => agreementService.getCandidates(),
                normalize: toList,
            },
            {
                key: "requirements",
                label: "open requirements",
                load: () => currentRequirementService.getCurrentRequirements(),
                normalize: toList,
            },
            {
                key: "interviews",
                label: "interview schedule",
                load: () => interviewScheduleService.getScheduledInterviews(),
                normalize: toList,
            },
            {
                key: "placements",
                label: "placement records",
                load: () => interviewScheduleService.getPlacedCandidates(),
                normalize: toList,
            },
            {
                key: "duePayments",
                label: "due payments",
                load: () => paymentService.getDuePayments(),
                normalize: toList,
            },
            {
                key: "paymentHistory",
                label: "payment history",
                load: () => paymentService.getPaymentHistory(),
                normalize: toList,
            },
            {
                key: "tdsDue",
                label: "unpaid company TDS",
                load: () => tdsService.getDueTds(),
                normalize: toList,
            },
            {
                key: "invoices",
                label: "GST invoices",
                load: () => gstBillService.getInvoices(),
                normalize: toList,
            },
            {
                key: "attendance",
                label: "attendance overview",
                load: () => attendanceService.getMonthlyAttendance(currentMonth),
                normalize: (value) => value && Array.isArray(value.employees)
                    ? value
                    : { employees: [] },
            },
        ];

        Promise.allSettled(sources.map((source) => source.load()))
            .then((results) => {
                if (!isMounted) return;

                const nextData = {};
                const nextAvailability = {};
                const nextErrors = [];

                results.forEach((result, index) => {
                    const source = sources[index];

                    if (result.status === "fulfilled") {
                        nextData[source.key] = source.normalize(result.value);
                        nextAvailability[source.key] = true;
                    } else {
                        nextData[source.key] = null;
                        nextAvailability[source.key] = false;
                        nextErrors.push(source.label);
                    }
                });

                setDashboardData(nextData);
                setAvailableSources(nextAvailability);
                setLoadErrors(nextErrors);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [currentMonth, reloadKey]);

    const candidates = dashboardData?.candidates || [];
    const requirements = dashboardData?.requirements || [];
    const interviews = dashboardData?.interviews || [];
    const placements = dashboardData?.placements || [];
    const duePayments = dashboardData?.duePayments || [];
    const paymentHistory = dashboardData?.paymentHistory || [];
    const tdsDue = dashboardData?.tdsDue || [];
    const invoices = dashboardData?.invoices || [];
    const attendanceRows = dashboardData?.attendance?.employees || [];

    const selectedMonthReceived = paymentHistory
        .filter((payment) => isInMonth(payment.paymentDate, selectedMonth))
        .reduce((total, payment) => total + asAmount(payment.paidAmount), 0);

    const selectedMonthPlacements = placements.filter((placement) =>
        isInMonth(placement.joiningDate, selectedMonth)
    ).length;

    const selectedMonthCandidates = candidates.filter((candidate) =>
        isInMonth(candidate.agreementDate, selectedMonth)
    ).length;

    const selectedMonthInterviews = interviews.filter((interview) =>
        isInMonth(interview.interviewDate, selectedMonth)
    ).length;

    const totalCashDue = duePayments.reduce(
        (total, payment) => total + asAmount(payment.dueAmount),
        0
    );

    const unpaidTdsTotal = tdsDue.reduce(
        (total, payment) => total + asAmount(payment.tdsAmount),
        0
    );

    const overduePayments = duePayments.filter((payment) =>
        asAmount(payment.dueAmount) > 0 &&
        dateKey(payment.dueDate) !== "" &&
        dateKey(payment.dueDate) < todayKey
    );

    const upcomingInterviews = interviews
        .filter((interview) => {
            const status = String(interview.interviewStatus || "").toLowerCase();
            const interviewDate = dateKey(interview.interviewDate);
            const endDate = new Date(today);
            endDate.setDate(endDate.getDate() + 7);

            return (
                (status === "scheduled" || status === "rescheduled") &&
                interviewDate >= todayKey &&
                interviewDate <= toLocalDateKey(endDate)
            );
        })
        .sort((first, second) => {
            const dateOrder = dateKey(first.interviewDate)
                .localeCompare(dateKey(second.interviewDate));
            return dateOrder || String(first.interviewTime || "")
                .localeCompare(String(second.interviewTime || ""));
        });

    const attendanceSummary = useMemo(() => {
        const summary = { present: 0, halfDay: 0, marked: 0 };
        const todayDay = Number(todayKey.slice(-2));

        attendanceRows.forEach((employee) => {
            const status = String(
                employee.attendanceByDay?.[todayDay] ||
                employee.attendanceByDay?.[String(todayDay)] ||
                ""
            ).toUpperCase();

            if (!status) return;
            summary.marked += 1;
            if (status === "P") summary.present += 1;
            if (status === "HD") summary.halfDay += 1;
        });

        return summary;
    }, [attendanceRows, todayKey]);

    const placementTrend = useMemo(() => {
        const [year, month] = selectedMonth.split("-").map(Number);

        return Array.from({ length: 6 }, (_, index) => {
            const date = new Date(year, month - 6 + index, 1);
            const key = getMonthKey(date);

            return {
                key,
                label: new Intl.DateTimeFormat("en-IN", {
                    month: "short",
                }).format(date),
                count: placements.filter((placement) =>
                    isInMonth(placement.joiningDate, key)
                ).length,
            };
        });
    }, [placements, selectedMonth]);

    const maxPlacementCount = Math.max(
        ...placementTrend.map((month) => month.count),
        1
    );

    const showValue = (source, value) => {
        if (availableSources[source] === false) return "—";
        if (!dashboardData && isLoading) return "…";
        return value;
    };

    const openPage = (path) => navigate(path);
    const overdueAmount = overduePayments.reduce(
        (total, payment) => total + asAmount(payment.dueAmount),
        0
    );

    return (
        <main className="shul-dashboard">
            <header className="shul-dashboard-header">
                <div>
                    <p className="shul-dashboard-eyebrow">SUPER ADMIN</p>
                    <h1 className="shul-dashboard-title">Dashboard</h1>
                    <p className="shul-dashboard-subtitle">
                        Overview of consultancy, accounts, and team activity
                    </p>
                </div>

                <div className="shul-dashboard-actions">
                    <label className="shul-dashboard-month">
                        <span aria-hidden="true">▦</span>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(event) => {
                                if (event.target.value) {
                                    setSelectedMonth(event.target.value);
                                }
                            }}
                            aria-label="Select dashboard month"
                        />
                    </label>
                    <button
                        className="shul-dashboard-refresh"
                        type="button"
                        onClick={() => setReloadKey((key) => key + 1)}
                        disabled={isLoading}
                    >
                        <span aria-hidden="true">↻</span>
                        {isLoading ? "Updating…" : "Refresh"}
                    </button>
                </div>
            </header>

            {loadErrors.length > 0 && (
                <div className="shul-dashboard-warning" role="status">
                    <span>
                        Some dashboard data could not be loaded
                        {" "}({loadErrors.join(", ")}). Affected values are shown as —.
                    </span>
                    <button
                        type="button"
                        onClick={() => setReloadKey((key) => key + 1)}
                    >
                        Try again
                    </button>
                </div>
            )}

            <section className="shul-dashboard-kpis" aria-label="Key business figures">
                <article className="shul-dashboard-kpi">
                    <div className="shul-dashboard-kpi-heading">
                        <span>Payments received</span>
                        <span className="shul-dashboard-icon blue" aria-hidden="true">₹</span>
                    </div>
                    <strong className="shul-dashboard-kpi-value">
                        {showValue("paymentHistory", formatCurrency(selectedMonthReceived))}
                    </strong>
                    <span className="shul-dashboard-kpi-note">
                        In {formatMonthLabel(selectedMonth)}
                    </span>
                </article>

                <article className="shul-dashboard-kpi">
                    <div className="shul-dashboard-kpi-heading">
                        <span>Cash still due</span>
                        <span className="shul-dashboard-icon orange" aria-hidden="true">↗</span>
                    </div>
                    <strong className="shul-dashboard-kpi-value">
                        {showValue("duePayments", formatCurrency(totalCashDue))}
                    </strong>
                    <span className="shul-dashboard-kpi-note">
                        Open cash balance; TDS tracked separately
                    </span>
                </article>

                <article className="shul-dashboard-kpi">
                    <div className="shul-dashboard-kpi-heading">
                        <span>Open requirements</span>
                        <span className="shul-dashboard-icon violet" aria-hidden="true">⌕</span>
                    </div>
                    <strong className="shul-dashboard-kpi-value">
                        {showValue("requirements", formatCount(requirements.length))}
                    </strong>
                    <span className="shul-dashboard-kpi-note">
                        Current associate company roles
                    </span>
                </article>

                <article className="shul-dashboard-kpi">
                    <div className="shul-dashboard-kpi-heading">
                        <span>Placements this month</span>
                        <span className="shul-dashboard-icon green" aria-hidden="true">✓</span>
                    </div>
                    <strong className="shul-dashboard-kpi-value">
                        {showValue("placements", formatCount(selectedMonthPlacements))}
                    </strong>
                    <span className="shul-dashboard-kpi-note">
                        Counted by candidate joining date
                    </span>
                </article>
            </section>

            <div className="shul-dashboard-main-grid">
                <section className="shul-dashboard-panel">
                    <div className="shul-dashboard-panel-heading">
                        <div>
                            <h2>Consultancy snapshot</h2>
                            <p>Candidate and placement activity for {formatMonthLabel(selectedMonth)}</p>
                        </div>
                        <button
                            className="shul-dashboard-text-link"
                            type="button"
                            onClick={() => openPage("/consultancy/all-candidates")}
                        >
                            View candidates <span aria-hidden="true">→</span>
                        </button>
                    </div>

                    <div className="shul-dashboard-pipeline">
                        <div className="shul-dashboard-pipeline-item">
                            <span>New candidates</span>
                            <strong>{showValue("candidates", formatCount(selectedMonthCandidates))}</strong>
                            <small>By agreement date</small>
                        </div>
                        <div className="shul-dashboard-pipeline-item">
                            <span>Open roles</span>
                            <strong>{showValue("requirements", formatCount(requirements.length))}</strong>
                            <small>Current requirements</small>
                        </div>
                        <div className="shul-dashboard-pipeline-item">
                            <span>Interview schedules</span>
                            <strong>{showValue("interviews", formatCount(selectedMonthInterviews))}</strong>
                            <small>Latest candidate rounds</small>
                        </div>
                        <div className="shul-dashboard-pipeline-item">
                            <span>Joinings</span>
                            <strong>{showValue("placements", formatCount(selectedMonthPlacements))}</strong>
                            <small>By joining date</small>
                        </div>
                    </div>

                    <div className="shul-dashboard-chart-heading">
                        <div>
                            <h3>Placement trend</h3>
                            <p>Joinings across the last six months</p>
                        </div>
                        <span className="shul-dashboard-chart-unit">Candidates</span>
                    </div>

                    {availableSources.placements === false ? (
                        <div className="shul-dashboard-empty-chart">
                            Placement trend is unavailable right now.
                        </div>
                    ) : !dashboardData && isLoading ? (
                        <div className="shul-dashboard-empty-chart">
                            Loading placement trend…
                        </div>
                    ) : (
                        <div
                            className="shul-dashboard-chart"
                            role="img"
                            aria-label={
                                "Placements by joining date for the six months ending " +
                                formatMonthLabel(selectedMonth)
                            }
                        >
                            {placementTrend.map((month) => (
                                <div className="shul-dashboard-chart-column" key={month.key}>
                                    <span className="shul-dashboard-chart-value">
                                        {formatCount(month.count)}
                                    </span>
                                    <div className="shul-dashboard-bar-track">
                                        <span
                                            className="shul-dashboard-bar"
                                            style={{
                                                height: Math.max(
                                                    month.count === 0
                                                        ? 3
                                                        : (month.count / maxPlacementCount) * 100,
                                                    3
                                                ) + "%",
                                            }}
                                        />
                                    </div>
                                    <span className="shul-dashboard-chart-label">{month.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="shul-dashboard-panel">
                    <div className="shul-dashboard-panel-heading">
                        <div>
                            <h2>Needs attention</h2>
                            <p>Live follow-ups across the modules</p>
                        </div>
                    </div>

                    <div className="shul-dashboard-attention-list">
                        <button
                            className="shul-dashboard-attention urgent"
                            type="button"
                            onClick={() => openPage("/accounts/due-payment")}
                        >
                            <span className="shul-dashboard-attention-icon">!</span>
                            <span className="shul-dashboard-attention-copy">
                                <strong>Overdue cash payments</strong>
                                <small>
                                    {availableSources.duePayments === false
                                        ? "Due payment data unavailable"
                                        : formatCurrency(overdueAmount) + " past due"}
                                </small>
                            </span>
                            <span className="shul-dashboard-attention-count">
                                {showValue("duePayments", formatCount(overduePayments.length))}
                            </span>
                            <span className="shul-dashboard-chevron" aria-hidden="true">›</span>
                        </button>

                        <button
                            className="shul-dashboard-attention warning"
                            type="button"
                            onClick={() => openPage("/accounts/due-tds")}
                        >
                            <span className="shul-dashboard-attention-icon">₹</span>
                            <span className="shul-dashboard-attention-copy">
                                <strong>Company TDS unpaid</strong>
                                <small>
                                    {availableSources.tdsDue === false
                                        ? "TDS data unavailable"
                                        : formatCurrency(unpaidTdsTotal) + " to remit"}
                                </small>
                            </span>
                            <span className="shul-dashboard-attention-count">
                                {showValue("tdsDue", formatCount(tdsDue.length))}
                            </span>
                            <span className="shul-dashboard-chevron" aria-hidden="true">›</span>
                        </button>

                        <button
                            className="shul-dashboard-attention"
                            type="button"
                            onClick={() => openPage("/consultancy/interview-schedule")}
                        >
                            <span className="shul-dashboard-attention-icon">◷</span>
                            <span className="shul-dashboard-attention-copy">
                                <strong>Upcoming interviews</strong>
                                <small>Scheduled in the next 7 days</small>
                            </span>
                            <span className="shul-dashboard-attention-count">
                                {showValue("interviews", formatCount(upcomingInterviews.length))}
                            </span>
                            <span className="shul-dashboard-chevron" aria-hidden="true">›</span>
                        </button>

                        <button
                            className="shul-dashboard-attention"
                            type="button"
                            onClick={() => openPage("/consultancy/view-requirement")}
                        >
                            <span className="shul-dashboard-attention-icon">⌕</span>
                            <span className="shul-dashboard-attention-copy">
                                <strong>Open requirements</strong>
                                <small>Associate company roles in progress</small>
                            </span>
                            <span className="shul-dashboard-attention-count">
                                {showValue("requirements", formatCount(requirements.length))}
                            </span>
                            <span className="shul-dashboard-chevron" aria-hidden="true">›</span>
                        </button>
                    </div>

                    <button
                        className="shul-dashboard-view-all"
                        type="button"
                        onClick={() => openPage("/accounts/payment-defaulter")}
                    >
                        Review payment defaulters <span aria-hidden="true">→</span>
                    </button>
                </section>
            </div>

            <div className="shul-dashboard-bottom-grid">
                <section className="shul-dashboard-panel">
                    <div className="shul-dashboard-panel-heading">
                        <div>
                            <h2>Accounts snapshot</h2>
                            <p>Current finance queues</p>
                        </div>
                        <button
                            className="shul-dashboard-text-link"
                            type="button"
                            onClick={() => openPage("/accounts/due-payment")}
                        >
                            Open accounts <span aria-hidden="true">→</span>
                        </button>
                    </div>
                    <button
                        className="shul-dashboard-summary-row"
                        type="button"
                        onClick={() => openPage("/accounts/due-payment")}
                    >
                        <span>Due payment records</span>
                        <strong>{showValue("duePayments", formatCount(duePayments.length))}</strong>
                        <span className="shul-dashboard-row-arrow" aria-hidden="true">→</span>
                    </button>
                    <button
                        className="shul-dashboard-summary-row"
                        type="button"
                        onClick={() => openPage("/accounts/due-tds")}
                    >
                        <span>Unpaid company TDS</span>
                        <strong>
                            {showValue(
                                "tdsDue",
                                formatCount(tdsDue.length) + " · " + formatCurrency(unpaidTdsTotal)
                            )}
                        </strong>
                        <span className="shul-dashboard-row-arrow" aria-hidden="true">→</span>
                    </button>
                    <button
                        className="shul-dashboard-summary-row"
                        type="button"
                        onClick={() => openPage("/accounts/gst-Invoice")}
                    >
                        <span>GST invoices</span>
                        <strong>{showValue("invoices", formatCount(invoices.length))}</strong>
                        <span className="shul-dashboard-row-arrow" aria-hidden="true">→</span>
                    </button>
                </section>

                <section className="shul-dashboard-panel">
                    <div className="shul-dashboard-panel-heading">
                        <div>
                            <h2>Team snapshot</h2>
                            <p>Active employees and today’s attendance</p>
                        </div>
                        <button
                            className="shul-dashboard-text-link"
                            type="button"
                            onClick={() => openPage("/attendance/view-attendance")}
                        >
                            View attendance <span aria-hidden="true">→</span>
                        </button>
                    </div>
                    <div className="shul-dashboard-team-highlight">
                        <span className="shul-dashboard-team-icon" aria-hidden="true">👥</span>
                        <div>
                            <strong>{showValue("attendance", formatCount(attendanceRows.length))}</strong>
                            <span>active employees</span>
                        </div>
                        <span className="shul-dashboard-team-date">
                            {new Intl.DateTimeFormat("en-IN", {
                                day: "numeric",
                                month: "short",
                            }).format(today)}
                        </span>
                    </div>
                    <div className="shul-dashboard-summary-row static">
                        <span>Present</span>
                        <strong>
                            {showValue("attendance", formatCount(attendanceSummary.present))}
                        </strong>
                    </div>
                    <div className="shul-dashboard-summary-row static">
                        <span>Half-day</span>
                        <strong>
                            {showValue("attendance", formatCount(attendanceSummary.halfDay))}
                        </strong>
                    </div>
                    <div className="shul-dashboard-summary-row static">
                        <span>Attendance marked</span>
                        <strong>
                            {availableSources.attendance === false
                                ? "—"
                                : formatCount(attendanceSummary.marked) + " / " + formatCount(attendanceRows.length)}
                        </strong>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Dashboard;
