import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { Link, useParams, useNavigate } from "react-router";
import API_BASE_URL from "../../../../services/api";
import associateCompanyService from "../../../../services/associateCompanyService";
import "./ViewAssociateDetail.css";

const DetailSection = ({ title, fields }) => (
    <section className="associate-detail-card">
        <h2>{title}</h2>
        <div className="associate-detail-grid">
            {fields.map(([label, value]) => (
                <div className="associate-detail-item" key={label}>
                    <span>{label}</span>
                    <strong>{value || "—"}</strong>
                </div>
            ))}
        </div>
    </section>
);

const paymentCategories = [
    { id: "paid", label: "Paid", className: "paid" },
    { id: "partial", label: "Partially Paid", className: "partial" },
    { id: "unpaid", label: "Unpaid", className: "unpaid" },
    { id: "defaulted", label: "Defaulted", className: "defaulted" },
];


const candidateSections = [
    {
        id: "scheduled",
        label: "Scheduled Candidates",
        statuses: ["Scheduled", "Rescheduled"],
        columns: [
            { key: "candidateName", label: "Candidate Name" },
            { key: "interviewDate", label: "Interview Date" },
            { key: "position", label: "Position" },
            { key: "interviewTime", label: "Interview Time" },
            { key: "interviewStatus", label: "Interview Status" },
            { key: "remark", label: "Remark" },
        ],
    },
    {
        id: "completed",
        label: "Completed Candidates",
        statuses: ["Completed"],
        columns: [
            { key: "candidateName", label: "Candidate Name" },
            { key: "interviewDate", label: "Interview Date" },
            { key: "position", label: "Position" },
            { key: "interviewTime", label: "Interview Time" },
            { key: "interviewStatus", label: "Interview Status" },
            { key: "remark", label: "Remark" },
        ],
    },
    {
        id: "placed",
        label: "Placed Candidates",
        statuses: ["Placed"],
        columns: [
            { key: "candidateName", label: "Candidate Name" },
            { key: "salaryPackage", label: "Salary Package" },
            { key: "position", label: "Position" },
            { key: "joiningDate", label: "Joining Date" },
            { key: "hrName", label: "HR Name" },
            { key: "remark", label: "Remark" },
        ],
    },
    {
        id: "rejected",
        label: "Rejected Candidates",
        statuses: ["Rejected"],
        columns: [
            { key: "candidateName", label: "Candidate Name" },
            { key: "interviewDate", label: "Interview Date" },
            { key: "position", label: "Position" },
            { key: "interviewTime", label: "Interview Time" },
            { key: "rejectionReason", label: "Rejection Reason" },
            { key: "remark", label: "Remark" },
        ],
    },
];


const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));

const categoryLabels = {
    paid: "Paid",
    partial: "Partially Paid",
    unpaid: "Unpaid",
    defaulted: "Defaulted",
};

const ViewAssociateDetails = () => {
    const { associateId } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activePaymentCategory, setActivePaymentCategory] = useState("paid");
    const [activeCandidateSection, setActiveCandidateSection] = useState("");

    const [paymentRecords, setPaymentRecords] = useState([]);
    const [paymentLoading, setPaymentLoading] = useState(true);
    const [paymentError, setPaymentError] = useState("");

    const [candidateRecords, setCandidateRecords] = useState([]);
    const [candidateLoading, setCandidateLoading] = useState(true);
    const [candidateError, setCandidateError] = useState("");
    const [candidateSearch, setCandidateSearch] = useState({});
    const [showAllCandidates, setShowAllCandidates] = useState({});

    const navigate = useNavigate();

    const { user } = useAuth();

    const [editingPayment, setEditingPayment] = useState(null);
    const [editBaseAmount, setEditBaseAmount] = useState("");
    const [savingBaseAmount, setSavingBaseAmount] = useState(false);
    const [baseAmountError, setBaseAmountError] = useState("");

    const grants = (user?.accessModules || "")
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean);

    const canEditPaymentAmounts =
        user?.role?.trim().toUpperCase() === "SUPER_ADMIN" ||
        grants.includes("ALL") ||
        grants.includes("ACCOUNTS") ||
        grants.includes("ACCOUNTS:PAYMENTS_DUE");

    useEffect(() => {
        let current = true;

        const loadCompany = async () => {
            setLoading(true);
            setError("");

            try {
                const data =
                    await associateCompanyService.getAssociateCompanyById(
                        associateId
                    );

                if (current) setCompany(data);
            } catch (loadError) {
                if (current) {
                    setError(
                        loadError.message || "Could not load associate details."
                    );
                }
            } finally {
                if (current) setLoading(false);
            }
        };

        loadCompany();

        return () => {
            current = false;
        };
    }, [associateId]);

    useEffect(() => {
        let current = true;

        const loadPaymentRecords = async () => {
            setPaymentLoading(true);
            setPaymentError("");

            try {
                const data =
                    await associateCompanyService
                        .getAssociateCompanyPaymentDetails(associateId);

                if (current) {
                    setPaymentRecords(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (current) {
                    setPaymentError(
                        loadError.message || "Could not load payment details."
                    );
                }
            } finally {
                if (current) {
                    setPaymentLoading(false);
                }
            }
        };

        loadPaymentRecords();

        return () => {
            current = false;
        };
    }, [associateId]);

    useEffect(() => {
        let current = true;

        const loadCandidateRecords = async () => {
            setCandidateLoading(true);
            setCandidateError("");

            try {
                const data =
                    await associateCompanyService
                        .getAssociateCompanyCandidateDetails(associateId);

                if (current) {
                    setCandidateRecords(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (current) {
                    setCandidateError(
                        loadError.message || "Could not load candidate details."
                    );
                }
            } finally {
                if (current) {
                    setCandidateLoading(false);
                }
            }
        };

        loadCandidateRecords();

        return () => {
            current = false;
        };
    }, [associateId]);

    if (loading) {
        return (
            <section id="main-content">
                <div className="associate-details-page">
                    <p className="associate-details-state">
                        Loading associate details...
                    </p>
                </div>
            </section>
        );
    }

    if (error || !company) {
        return (
            <section id="main-content">
                <div className="associate-details-page">
                    <div className="associate-details-heading">
                        <div>
                            <h1>Associate Details</h1>
                            <p>View company information and related records</p>
                        </div>
                        <Link
                            to="/consultancy/view-associate-company"
                            className="associate-back-button"
                        >
                            ← Back to Associates
                        </Link>
                    </div>
                    <p className="associate-details-state associate-details-error">
                        {error || "Associate company not found."}
                    </p>
                </div>
            </section>
        );
    }

    const selectedCandidateSection = candidateSections.find(
        (section) => section.id === activeCandidateSection
    );

    const candidateRowsForSection = selectedCandidateSection
        ? candidateRecords
            .filter((record) =>
                selectedCandidateSection.statuses.includes(record.interviewStatus)
            )
            .filter((record) => {
                const query = (
                    candidateSearch[selectedCandidateSection.id] || ""
                )
                    .trim()
                    .toLowerCase();

                if (!query) {
                    return true;
                }

                return selectedCandidateSection.columns.some(({ key }) =>
                    String(record[key] ?? "").toLowerCase().includes(query)
                );
            })
        : [];

    const visibleCandidateRows = selectedCandidateSection
        ? showAllCandidates[selectedCandidateSection.id]
            ? candidateRowsForSection
            : candidateRowsForSection.slice(0, 5)
        : [];

    const visiblePayments = paymentRecords.filter(
        (payment) => payment.category === activePaymentCategory
    );

    const previewBaseAmount = Number(editBaseAmount);

    const previewGstAmount =
        editingPayment?.gstEnabled && Number.isFinite(previewBaseAmount)
            ? Math.round(
                (previewBaseAmount * 0.18 + Number.EPSILON) * 100
            ) / 100
            : 0;

    const previewTotalAmount =
        (Number.isFinite(previewBaseAmount) ? previewBaseAmount : 0) +
        previewGstAmount;

    const openBaseAmountModal = (payment) => {
        if (!payment.paymentId || payment.category === "defaulted") {
            return;
        }

        setEditingPayment(payment);
        setEditBaseAmount(String(payment.baseAmount ?? ""));
        setBaseAmountError("");
    };

    const closeBaseAmountModal = () => {
        if (savingBaseAmount) return;

        setEditingPayment(null);
        setEditBaseAmount("");
        setBaseAmountError("");
    };

    const saveBaseAmount = async (event) => {
        event.preventDefault();

        if (!editingPayment || savingBaseAmount) return;

        const newBaseAmount = Number(editBaseAmount);

        if (!Number.isFinite(newBaseAmount) || newBaseAmount < 0) {
            setBaseAmountError("Enter a valid base amount of zero or more.");
            return;
        }

        const newGstAmount = editingPayment.gstEnabled
            ? Math.round((newBaseAmount * 0.18 + Number.EPSILON) * 100) / 100
            : 0;

        const newTotalAmount = newBaseAmount + newGstAmount;
        const paidAmount = Number(editingPayment.paidAmount || 0);

        if (newTotalAmount < paidAmount) {
            setBaseAmountError(
                `New total (${formatCurrency(newTotalAmount)}) cannot be less than paid amount (${formatCurrency(paidAmount)}).`
            );
            return;
        }

        if (Number(editingPayment.tdsAmount || 0) > newGstAmount) {
            setBaseAmountError(
                "The new GST amount cannot be less than the existing TDS amount."
            );
            return;
        }

        setSavingBaseAmount(true);
        setBaseAmountError("");

        try {
            await associateCompanyService.updateAssociateCompanyPaymentBaseAmount(
                associateId,
                editingPayment.paymentId,
                newBaseAmount
            );

            const refreshedPayments =
                await associateCompanyService.getAssociateCompanyPaymentDetails(
                    associateId
                );

            setPaymentRecords(
                Array.isArray(refreshedPayments) ? refreshedPayments : []
            );
            setEditingPayment(null);
            setEditBaseAmount("");
        } catch (saveError) {
            setBaseAmountError(
                saveError.message || "Could not update the base amount."
            );
        } finally {
            setSavingBaseAmount(false);
        }
    };

    return (
        <section id="main-content">
            <div className="associate-details-page">
                <div className="associate-details-heading">
                    <div>
                        <h1>🤝 {company.companyName}</h1>
                        <p>Associate company details</p>
                    </div>

                    <div className="associate-details-heading-actions">
                        <button
                            type="button"
                            className="associate-update-button"
                            onClick={() =>
                                navigate(`/consultancy/update-associate-company-profile/${associateId}`)
                            }
                        >
                            ✎ Update Details
                        </button>

                        <Link
                            to="/consultancy/view-associate-company"
                            className="associate-back-button"
                        >
                            ← Back to Associates
                        </Link>
                    </div>
                </div>

                <DetailSection
                    title="Associate Details"
                    fields={[
                        ["Company Name", company.companyName],
                        ["Address", company.location],
                        ["Shipping Address", company.shippingAddress],
                        ["GST Number", company.gstNumber],
                    ]}
                />

                <DetailSection
                    title="Company Work Details"
                    fields={[
                        ["Working Domain", company.workingDomain],
                        ["Working Technology", company.workingTechnology],
                        ["No. of Employees", company.noOfEmployee],
                    ]}
                />

                <DetailSection
                    title="Contact Person Details"
                    fields={[
                        ["Contact Person", company.contactPerson],
                        ["Phone", company.phone],
                        ["Email", company.email],
                        ["Manager Name", company.managerName],
                        ["Manager Phone", company.managerPhone],
                        ["Manager Email", company.managerEmail],
                    ]}
                />

                <DetailSection
                    title="Packages Details"
                    fields={[
                        ["Pay Package Fresher", company.payPackageFresher],
                        [
                            "Pay Package Experienced",
                            company.payPackageExperienced,
                        ],
                    ]}
                />

                <section className="associate-detail-card">
                    <h2>SLA & Invoice Details</h2>
                    <div className="associate-detail-grid">
                        <div className="associate-detail-item">
                            <span>SLA Agreed</span>
                            <strong>{company.slaAgreed || "—"}</strong>
                        </div>

                        <div className="associate-detail-item">
                            <span>Pay For Fresher</span>
                            <strong>
                                {company.slaAgreed === "YES"
                                    ? company.payForFresher || "—"
                                    : "—"}
                            </strong>
                        </div>

                        <div className="associate-detail-item">
                            <span>Pay For Experienced</span>
                            <strong>
                                {company.slaAgreed === "YES"
                                    ? company.payForExperienced || "—"
                                    : "—"}
                            </strong>
                        </div>

                        <div className="associate-detail-item">
                            <span>Invoice Send Text</span>
                            <strong>{company.invoiceSendText || "—"}</strong>
                        </div>

                        <div className="associate-detail-item">
                            <span>SLA Document</span>
                            {company.slaDocument ? (
                                <a
                                    href={`${API_BASE_URL}/associate-companies/${encodeURIComponent(
                                        associateId
                                    )}/sla-document`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="associate-document-link"
                                >
                                    View / Download
                                </a>
                            ) : (
                                <strong>Not Uploaded</strong>
                            )}
                        </div>
                    </div>
                </section>

                <section className="associate-detail-card associate-related-card">
                    <h2>Payment Details</h2>

                    <div
                        className="associate-category-buttons"
                        role="tablist"
                        aria-label="Payment categories"
                    >
                        {paymentCategories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                role="tab"
                                aria-selected={
                                    activePaymentCategory === category.id
                                }
                                className={`associate-category-button ${category.className} ${activePaymentCategory === category.id
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setActivePaymentCategory(category.id)
                                }
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>

                    <div className="associate-table-wrapper">
                        <table className="associate-related-table">
                            <thead>
                                <tr>
                                    <th>Candidate Name</th>
                                    <th>Base Amount</th>
                                    <th>GST Amount</th>
                                    <th>Total Amount</th>
                                    <th>Paid Amount</th>
                                    <th>TDS Amount</th>
                                    <th>Balance Amount</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Edit Base Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentLoading ? (
                                    <tr>
                                        <td colSpan="10" className="associate-empty-cell">
                                            Loading payment details…
                                        </td>
                                    </tr>
                                ) : paymentError ? (
                                    <tr>
                                        <td colSpan="10" className="associate-empty-cell">
                                            {paymentError}
                                        </td>
                                    </tr>
                                ) : visiblePayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="associate-empty-cell">
                                            No {categoryLabels[activePaymentCategory].toLowerCase()} records.
                                        </td>
                                    </tr>
                                ) : (
                                    visiblePayments.map((payment) => (
                                        <tr key={payment.interviewId}>
                                            <td>{payment.candidateName}</td>
                                            <td>{formatCurrency(payment.baseAmount)}</td>
                                            <td>{formatCurrency(payment.gstAmount)}</td>
                                            <td>{formatCurrency(payment.totalAmount)}</td>
                                            <td>{formatCurrency(payment.paidAmount)}</td>
                                            <td>
                                                {Number(payment.tdsAmount) > 0
                                                    ? `${formatCurrency(payment.tdsAmount)}${payment.tdsPaid ? " (Paid)" : " (Unpaid)"
                                                    }`
                                                    : "—"}
                                            </td>
                                            <td>{formatCurrency(payment.balanceAmount)}</td>
                                            <td>{payment.dueDate || "—"}</td>
                                            <td>
                                                <span
                                                    className={`associate-payment-status ${payment.category}`}
                                                >
                                                    {categoryLabels[payment.category]}
                                                </span>
                                            </td>
                                            <td>
                                                {canEditPaymentAmounts && payment.paymentId ? (
                                                    <button
                                                        type="button"
                                                        className="associate-payment-edit-amount-btn"
                                                        disabled={payment.category === "defaulted"}
                                                        title={
                                                            payment.category === "defaulted"
                                                                ? "A defaulted payment amount cannot be changed."
                                                                : "Edit base amount"
                                                        }
                                                        onClick={() => openBaseAmountModal(payment)}
                                                    >
                                                        Edit Amount
                                                    </button>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {editingPayment && (
                    <div
                        className="associate-base-modal-backdrop"
                        onClick={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                !savingBaseAmount
                            ) {
                                closeBaseAmountModal();
                            }
                        }}
                    >
                        <section
                            className="associate-base-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="associate-base-modal-title"
                        >
                            <h2 id="associate-base-modal-title">Edit Base Amount</h2>

                            <div className="associate-base-amount-summary">
                                <p>
                                    <strong>Current Base Amount:</strong>{" "}
                                    {formatCurrency(editingPayment.baseAmount)}
                                </p>

                                {editingPayment.gstEnabled && (
                                    <p>
                                        <strong>Current GST Amount:</strong>{" "}
                                        {formatCurrency(editingPayment.gstAmount)}
                                    </p>
                                )}

                                <p>
                                    <strong>Current Total Amount:</strong>{" "}
                                    {formatCurrency(editingPayment.totalAmount)}
                                </p>
                            </div>

                            <form onSubmit={saveBaseAmount}>
                                <label htmlFor="associate-new-base-amount">
                                    New Base Amount (without GST)
                                </label>
                                <input
                                    id="associate-new-base-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editBaseAmount}
                                    onChange={(event) => setEditBaseAmount(event.target.value)}
                                    required
                                />

                                <p className="associate-base-amount-note">
                                    Total amount will be calculated after adding GST.
                                </p>

                                {editingPayment.gstEnabled ? (
                                    <div className="associate-base-amount-preview">
                                        <p>
                                            <strong>Calculated GST (18%):</strong>{" "}
                                            {formatCurrency(previewGstAmount)}
                                        </p>
                                        <p>
                                            <strong>New Total Amount:</strong>{" "}
                                            {formatCurrency(previewTotalAmount)}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="associate-base-amount-preview">
                                        GST is not enabled. Total amount will equal the base
                                        amount: {formatCurrency(previewTotalAmount)}
                                    </p>
                                )}

                                {baseAmountError && (
                                    <p className="associate-base-amount-error" role="alert">
                                        {baseAmountError}
                                    </p>
                                )}

                                <div className="associate-base-modal-actions">
                                    <button
                                        type="button"
                                        onClick={closeBaseAmountModal}
                                        disabled={savingBaseAmount}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={savingBaseAmount}>
                                        {savingBaseAmount ? "Saving..." : "Save Amount"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                <section className="associate-candidate-controls">
                    {candidateSections.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            className={`associate-candidate-button ${activeCandidateSection === section.id
                                ? "active"
                                : ""
                                }`}
                            aria-expanded={
                                activeCandidateSection === section.id
                            }
                            onClick={() =>
                                setActiveCandidateSection((current) =>
                                    current === section.id ? "" : section.id
                                )
                            }
                        >
                            {section.label}
                        </button>
                    ))}
                </section>

                {selectedCandidateSection && (
                    <section className="associate-detail-card associate-related-card">
                        <h2>{selectedCandidateSection.label}</h2>

                        <div className="associate-candidate-search">
                            <input
                                type="search"
                                value={candidateSearch[selectedCandidateSection.id] || ""}
                                placeholder={`Search ${selectedCandidateSection.label.toLowerCase()}...`}
                                aria-label={`Search ${selectedCandidateSection.label}`}
                                onChange={(event) =>
                                    setCandidateSearch((current) => ({
                                        ...current,
                                        [selectedCandidateSection.id]: event.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="associate-table-wrapper">
                            <table className="associate-related-table">
                                <thead>
                                    <tr>
                                        {selectedCandidateSection.columns.map((column) => (
                                            <th key={column.key}>{column.label}</th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {candidateLoading ? (
                                        <tr>
                                            <td
                                                colSpan={selectedCandidateSection.columns.length}
                                                className="associate-empty-cell"
                                            >
                                                Loading candidate details…
                                            </td>
                                        </tr>
                                    ) : candidateError ? (
                                        <tr>
                                            <td
                                                colSpan={selectedCandidateSection.columns.length}
                                                className="associate-empty-cell"
                                            >
                                                {candidateError}
                                            </td>
                                        </tr>
                                    ) : candidateRowsForSection.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={selectedCandidateSection.columns.length}
                                                className="associate-empty-cell"
                                            >
                                                No matching candidates.
                                            </td>
                                        </tr>
                                    ) : (
                                        visibleCandidateRows.map((record) => (
                                            <tr key={record.interviewId}>
                                                {selectedCandidateSection.columns.map((column) => (
                                                    <td key={column.key}>
                                                        {record[column.key] || "—"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {!candidateLoading &&
                            !candidateError &&
                            candidateRowsForSection.length > 5 && (
                                <button
                                    type="button"
                                    className="associate-candidate-more"
                                    onClick={() =>
                                        setShowAllCandidates((current) => ({
                                            ...current,
                                            [selectedCandidateSection.id]:
                                                !current[selectedCandidateSection.id],
                                        }))
                                    }
                                >
                                    {showAllCandidates[selectedCandidateSection.id]
                                        ? "Show Less"
                                        : `See More (${candidateRowsForSection.length - 5})`}
                                </button>
                            )}
                    </section>
                )}
            </div>
        </section>
    );
};
export default ViewAssociateDetails;