import "./Dashboard.css";

function Dashboard() {

    return (
        <main className="shul-dashboard">

            {/* =========================
                PAGE HEADER
            ========================== */}

            <div className="shul-dashboard-header-row">
                <div>
                    <h1 className="shul-dashboard-title">
                        Dashboard
                    </h1>

                    <div className="shul-dashboard-subtitle">
                        Overview of your business
                    </div>
                </div>

                <button
                    type="button"
                    className="shul-month-trigger"
                >
                    📅
                    <span>
                        Select Month
                    </span>
                    ▼
                </button>
            </div>


            {/* =========================
                STAT CARDS
            ========================== */}

            <div className="shul-kpi-grid">

                <div className="shul-kpi-card clients">
                    <div>
                        <div className="shul-kpi-value">
                            0
                        </div>
                        <div className="shul-kpi-label">
                            Total Clients
                        </div>
                    </div>
                    <div className="shul-kpi-icon">
                        👥
                    </div>
                </div>


                <div className="shul-kpi-card payments">
                    <div>
                        <div className="shul-kpi-value">
                            1
                        </div>

                        <div className="shul-kpi-label">
                            Total Payments
                        </div>
                    </div>
                    <div className="shul-kpi-icon">
                        💰
                    </div>
                </div>


                <div className="shul-kpi-card due">

                    <div>
                        <div className="shul-kpi-value">
                            1
                        </div>

                        <div className="shul-kpi-label">
                            Total Due Payments
                        </div>
                    </div>

                    <div className="shul-kpi-icon">
                        💳
                    </div>
                </div>


                <div className="shul-kpi-card expenses">

                    <div>
                        <div className="shul-kpi-value">
                            ₹10,000.00
                        </div>

                        <div className="shul-kpi-label">
                            Total Expenses
                        </div>
                    </div>

                    <div className="shul-kpi-icon">
                        📈
                    </div>
                </div>
            </div>


            {/* =========================
                PENDING ALERTS
            ========================== */}

            <section className="shul-alert-section">

                <div className="shul-section-title">
                    ⚠️ Pending Alerts
                </div>


                <div className="shul-alert-grid">

                    <div className="shul-alert-card danger">

                        <span className="shul-alert-icon">
                            🔴
                        </span>

                        <div>
                            <div className="shul-alert-label">
                                Pending Services
                            </div>

                            <div className="shul-alert-value">
                                0
                            </div>
                        </div>

                        <span className="alert-arrow">
                            →
                        </span>
                    </div>

                    <div className="shul-alert-card warning">

                        <span className="shul-alert-icon">
                            ⚠️
                        </span>

                        <div>
                            <div className="shul-alert-label">
                                Open Complaints
                            </div>
                            <div className="shul-alert-value">
                                0
                            </div>
                        </div>
                        <span className="alert-arrow">
                            →
                        </span>
                    </div>
                </div>
            </section>


            {/* =========================
                MONTHLY SERVICES
            ========================== */}

            <section className="shul-chart-card">

                <div className="shul-chart-head">

                    <div>
                        <div className="shul-chart-title">
                            📊 Monthly Services Overview
                        </div>

                        <div className="shul-chart-subtitle">
                            Pending service count by month
                        </div>
                    </div>

                    <div className="chart-year-badge">
                        2026
                    </div>
                </div>


                <div className="shul-chart-box">

                    <div className="chart-placeholder">
                        <span>0</span>
                        <div className="chart-line"></div>
                        <small>
                            Monthly services chart
                        </small>
                    </div>
                </div>
            </section>
        </main>
    );
}
export default Dashboard;