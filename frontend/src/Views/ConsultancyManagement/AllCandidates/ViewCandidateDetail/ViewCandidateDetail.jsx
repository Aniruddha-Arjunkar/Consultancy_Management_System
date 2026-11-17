import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "../../../../context/AuthContext";
import agreementService from "../../../../services/agreementService";
import "./ViewCandidateDetail.css";

const display = (value) =>
    value === null || value === undefined || value === "" ? "—" : value;

const formatPercent = (value) =>
    value === null || value === undefined || value === ""
        ? "—"
        : `${value}%`;

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const ViewCandidateDetail = () => {
    const { candidateId } = useParams();
    const navigate = useNavigate();

    const location = useLocation();
    const { user } = useAuth();

    const [paymentData, setPaymentData] = useState(null);
    const [paymentsLoading, setPaymentsLoading] = useState(true);
    const [paymentError, setPaymentError] = useState("");

    const grants = (user?.accessModules || "")
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean);

    const canUpdatePayments =
        user?.role?.trim().toUpperCase() === "SUPER_ADMIN" ||
        grants.includes("ALL") ||
        grants.includes("ACCOUNTS") ||
        grants.includes("ACCOUNTS:PAYMENTS_DUE");


    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [blacklisting, setBlacklisting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [interviews, setInterviews] = useState([]);
    const [interviewsLoading, setInterviewsLoading] = useState(true);
    const [interviewError, setInterviewError] = useState("");

    const [editingPayment, setEditingPayment] = useState(null);
    const [editBaseAmount, setEditBaseAmount] = useState("");
    const [savingBaseAmount, setSavingBaseAmount] = useState(false);
    const [baseAmountError, setBaseAmountError] = useState("");

    useEffect(() => {
        let active = true;

        const loadCandidate = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await agreementService.getCandidate(candidateId);
                if (active) setCandidate(data);
            } catch (loadError) {
                if (active) {
                    setError(
                        loadError.message || "Could not load candidate details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadCandidate();

        return () => {
            active = false;
        };
    }, [candidateId]);


    useEffect(() => {
        let active = true;

        const loadInterviews = async () => {
            setInterviewsLoading(true);
            setInterviewError("");

            try {
                const data =
                    await agreementService.getCandidateInterviews(candidateId);

                if (active) {
                    setInterviews(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    setInterviewError(
                        loadError.message ||
                        "Could not load interview and placement details."
                    );
                }
            } finally {
                if (active) setInterviewsLoading(false);
            }
        };

        loadInterviews();

        return () => {
            active = false;
        };
    }, [candidateId]);

    useEffect(() => {
        let active = true;

        const loadPayments = async () => {
            setPaymentsLoading(true);
            setPaymentError("");

            try {
                const data =
                    await agreementService.getCandidatePayments(candidateId);

                if (active) {
                    setPaymentData(data);
                }
            } catch (loadError) {
                if (active) {
                    setPaymentError(
                        loadError.message || "Could not load payment details."
                    );
                }
            } finally {
                if (active) {
                    setPaymentsLoading(false);
                }
            }
        };

        loadPayments();

        return () => {
            active = false;
        };
    }, [candidateId]);

    const openBaseAmountModal = (payment) => {
        if (
            !payment.baseAmountEditable ||
            paymentData?.candidateStatus === "DEFAULTER"
        ) {
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
                `New total amount (${formatCurrency(newTotalAmount)}) cannot be less than the amount already paid (${formatCurrency(paidAmount)}).`
            );
            return;
        }

        setSavingBaseAmount(true);
        setBaseAmountError("");

        try {
            await agreementService.updateCandidatePaymentBaseAmount(
                candidateId,
                editingPayment.paymentId,
                newBaseAmount
            );

            const refreshedData =
                await agreementService.getCandidatePayments(candidateId);

            setPaymentData(refreshedData);
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

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <p>Loading candidate details...</p>
                </section>
            </section>
        );
    }

    if (error || !candidate) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="view-clients-page candidate-detail-page">
                        <p>{error || "Candidate record not found."}</p>
                        <button
                            type="button"
                            className="candidate-detail-back-btn"
                            onClick={() =>
                                navigate("/consultancy/all-candidates")
                            }
                        >
                            ← Back to All Candidates
                        </button>
                    </div>
                </section>
            </section>
        );
    }

    const education = [
        {
            qualification: "10th",
            year: candidate.tenThYearOfPassing,
            percentage: candidate.tenThPercentage,
        },
        {
            qualification: "12th",
            year: candidate.twelveThYearOfPassing,
            percentage: candidate.twelveThPercentage,
        },
        {
            qualification: candidate.graduation,
            year: candidate.graduationYearOfPassing,
            percentage: candidate.graduationPercentage,
        },
        {
            qualification: candidate.postGraduation,
            year: candidate.postGraduationYearOfPassing,
            percentage: candidate.postGraduationPercentage,
        },
    ].filter(
        (row) =>
            row.qualification ||
            row.year ||
            row.percentage !== null && row.percentage !== undefined
    );

    const handleBlacklist = async () => {
        if (candidate.status === "Blacklisted" || blacklisting) return;

        const confirmed = window.confirm(
            `Are you sure you want to blacklist ${candidate.name}?`
        );

        if (!confirmed) return;

        setBlacklisting(true);

        try {
            const updatedCandidate =
                await agreementService.blacklistCandidate(candidate.id);

            setCandidate(updatedCandidate);
            window.alert("Candidate has been blacklisted.");
        } catch (blacklistError) {
            window.alert(
                blacklistError.message || "Could not blacklist this candidate."
            );
        } finally {
            setBlacklisting(false);
        }
    };


    const handleDeleteCandidate = async () => {
        if (deleting) return;

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this candidate?"
        );

        if (!confirmed) return;

        setDeleting(true);

        try {
            await agreementService.deleteCandidate(candidate.id);
            window.alert("Candidate deleted successfully.");
            navigate("/consultancy/all-candidates");
        } catch (deleteError) {
            window.alert(
                deleteError.message || "Could not delete this candidate."
            );
        } finally {
            setDeleting(false);
        }
    };


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
    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page candidate-detail-page">
                    <div className="candidate-detail-topbar">
                        <button
                            type="button"
                            className="candidate-detail-back-btn"
                            onClick={() =>
                                navigate("/consultancy/all-candidates")
                            }
                        >
                            ← Back to All Candidates
                        </button>

                        <div className="candidate-detail-actions">
                            <button
                                type="button"
                                className="candidate-detail-action candidate-detail-delete"
                                onClick={handleDeleteCandidate}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete Candidate"}
                            </button>

                            <button
                                type="button"
                                className="candidate-detail-action candidate-detail-update"
                                onClick={() =>
                                    navigate(`/consultancy/update-candidate/${candidate.id}`)
                                }
                            >
                                Edit &amp; Update Details
                            </button>

                            {candidate.status === "Blacklisted" ? (
                                <button
                                    type="button"
                                    className="candidate-detail-action candidate-detail-blacklist candidate-detail-already-blacklisted"
                                    disabled
                                >
                                    Already Blacklisted
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="candidate-detail-action candidate-detail-blacklist"
                                    onClick={handleBlacklist}
                                    disabled={blacklisting}
                                >
                                    {blacklisting ? "Blacklisting..." : "Blacklist Candidate"}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    👤
                                </span>
                                Candidate Details
                            </h1>
                            <p className="view-clients-subtitle">
                                Personal, education, experience, interview, and
                                payment information
                            </p>
                        </div>

                        <span className="view-clients-count">
                            Candidate ID: {candidate.id}
                        </span>
                    </div>

                    <div className="view-clients-card candidate-detail-card">
                        <section className="candidate-detail-section">
                            <h2>👤 Personal Details</h2>
                            <div className="candidate-detail-grid">
                                <div><strong>Name</strong><span>{display(candidate.name)}</span></div>
                                <div><strong>Mobile No.</strong><span>{display(candidate.phone)}</span></div>
                                <div><strong>Email</strong><span>{display(candidate.email)}</span></div>
                                <div><strong>Date of Birth</strong><span>{display(candidate.dob)}</span></div>
                                <div><strong>Gender</strong><span>{display(candidate.gender)}</span></div>
                                <div><strong>Address</strong><span>{display(candidate.address)}</span></div>
                                <div><strong>Job Profile</strong><span>{display(candidate.jobProfile)}</span></div>
                                <div><strong>Agreement Date</strong><span>{display(candidate.agreementDate)}</span></div>
                                <div><strong>Status</strong><span>{display(candidate.status)}</span></div>
                                <div><strong>Shipping Address</strong><span>{display(candidate.shippingAddress)}</span></div>
                                <div><strong>GST Number</strong><span>{display(candidate.gstNumber)}</span></div>
                            </div>
                        </section>

                        <section className="candidate-detail-section">
                            <h2>🎓 Education Details</h2>
                            {education.length > 0 ? (
                                <div className="view-clients-table-wrapper">
                                    <table className="view-clients-table candidate-detail-table">
                                        <thead>
                                            <tr>
                                                <th>Qualification</th>
                                                <th>Year of Passing</th>
                                                <th>Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {education.map((row, index) => (
                                                <tr key={`${row.qualification}-${index}`}>
                                                    <td>{display(row.qualification)}</td>
                                                    <td>{display(row.year)}</td>
                                                    <td>{formatPercent(row.percentage)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="candidate-detail-empty">
                                    No education details available.
                                </p>
                            )}
                        </section>

                        <section className="candidate-detail-section">
                            <h2>💼 Experience / Skills</h2>
                            <div className="candidate-detail-grid">
                                <div><strong>Experience</strong><span>{display(candidate.experience)}</span></div>
                                <div><strong>Experience Description</strong><span>{display(candidate.experienceDescription)}</span></div>
                                <div className="candidate-detail-wide"><strong>Skills</strong><span>{display(candidate.skills)}</span></div>
                                <div>
                                    <strong>Resume</strong>
                                    <span>{candidate.resume ? (
                                        <a
                                            href={agreementService.getCandidateResumeUrl(candidate.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="candidate-resume-link"
                                        >
                                            Open Resume
                                        </a>
                                    ) : (
                                        <span>No resume</span>
                                    )}</span>
                                </div>
                            </div>
                        </section>

                        <section className="candidate-detail-section">
                            <h2>📋 Interview and Placement Details</h2>

                            {interviewsLoading ? (
                                <p className="candidate-detail-empty">
                                    Loading interview and placement details...
                                </p>
                            ) : interviewError ? (
                                <p className="candidate-detail-empty" role="alert">
                                    {interviewError}
                                </p>
                            ) : interviews.length > 0 ? (
                                <div className="view-clients-table-wrapper">
                                    <table className="view-clients-table candidate-detail-table">
                                        <thead>
                                            <tr>
                                                <th>Company</th>
                                                <th>Position</th>
                                                <th>Interview Date</th>
                                                <th>Interview Round</th>
                                                <th>Remark</th>
                                                <th>Interview Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {interviews.map((interview) => (
                                                <tr key={interview.interviewId}>
                                                    <td>{display(interview.companyName)}</td>
                                                    <td>{display(interview.position)}</td>
                                                    <td>{display(interview.interviewDate)}</td>
                                                    <td>{display(interview.interviewRound)}</td>
                                                    <td>{display(interview.remark)}</td>
                                                    <td>{display(interview.interviewStatus)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="candidate-detail-empty">
                                    No interview or placement details available for this candidate.
                                </p>
                            )}
                        </section>

                        <section className="candidate-detail-section">
                            <h2>💳 Payment Details</h2>

                            {paymentsLoading ? (
                                <p className="candidate-detail-empty">Loading payment details...</p>
                            ) : paymentError ? (
                                <p className="candidate-detail-empty" role="alert">
                                    {paymentError}
                                </p>
                            ) : (
                                <>
                                    <p className="candidate-payment-summary">
                                        Candidate Status:{" "}
                                        <strong
                                            className={
                                                paymentData?.candidateStatus === "DEFAULTER"
                                                    ? "candidate-payment-defaulter"
                                                    : "candidate-payment-active"
                                            }
                                        >
                                            {paymentData?.candidateStatus || "ACTIVE"}
                                        </strong>
                                    </p>

                                    {paymentData?.payments?.length > 0 ? (
                                        <>
                                            <div className="view-clients-table-wrapper">
                                                <table className="view-clients-table candidate-detail-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Total Amount</th>
                                                            <th>Paid Amount</th>
                                                            <th>Payment Date</th>
                                                            <th>Gateway</th>
                                                            <th>Payment Status</th>
                                                            <th>Candidate Status</th>
                                                            <th>Edit Base Amount</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paymentData.payments.map((payment) => {
                                                            const isDefaulter = paymentData.candidateStatus === "DEFAULTER";

                                                            return (
                                                                <tr key={payment.paymentId}>
                                                                    <td>{formatCurrency(payment.totalAmount)}</td>
                                                                    <td>{formatCurrency(payment.paidAmount)}</td>
                                                                    <td>{display(payment.paymentDate)}</td>
                                                                    <td>{display(payment.paymentGateway)}</td>
                                                                    <td>{payment.paymentStatus}</td>
                                                                    <td>{paymentData.candidateStatus}</td>
                                                                    <td>{canUpdatePayments && payment.baseAmountEditable ? (
                                                                        <button
                                                                            type="button"
                                                                            className="candidate-payment-edit-amount-btn"
                                                                            disabled={paymentData.candidateStatus === "DEFAULTER"}
                                                                            title={
                                                                                paymentData.candidateStatus === "DEFAULTER"
                                                                                    ? "A defaulter's payment amount cannot be edited."
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
                                                                    <td>
                                                                        {canUpdatePayments ? (
                                                                            <button
                                                                                className="view-candidate-detail-payment-update-btn"
                                                                                type="button"
                                                                                disabled={isDefaulter}
                                                                                title={
                                                                                    isDefaulter
                                                                                        ? "Payments cannot be updated while this candidate is a defaulter."
                                                                                        : "Update payment"
                                                                                }
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        `/accounts/due-payment/update/${payment.paymentId}`,
                                                                                        {
                                                                                            state: {
                                                                                                returnTo: location.pathname,
                                                                                            },
                                                                                        }
                                                                                    )
                                                                                }
                                                                            >
                                                                                Update Payment
                                                                            </button>
                                                                        ) : (
                                                                            <span>Accounts payment access required</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <p className="candidate-payment-total">
                                                <strong>Total Paid Amount:</strong>{" "}
                                                {formatCurrency(paymentData.totalPaidAmount)}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="candidate-detail-empty">
                                            No candidate payment details available.
                                        </p>
                                    )}
                                </>
                            )}
                        </section>

                        {editingPayment && (
                            <div
                                className="candidate-base-modal-backdrop"
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
                                    className="candidate-base-modal"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="candidate-base-modal-title"
                                >
                                    <h2 id="candidate-base-modal-title">Edit Base Amount</h2>

                                    <div className="candidate-base-amount-summary">
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
                                        <label htmlFor="candidate-new-base-amount">
                                            New Base Amount (without GST)
                                        </label>
                                        <input
                                            id="candidate-new-base-amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={editBaseAmount}
                                            onChange={(event) => setEditBaseAmount(event.target.value)}
                                            required
                                        />

                                        <p className="candidate-base-amount-note">
                                            Total amount will be calculated after adding GST.
                                        </p>

                                        {editingPayment.gstEnabled ? (
                                            <div className="candidate-base-amount-preview">
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
                                            <p className="candidate-base-amount-preview">
                                                GST is not enabled for this payment. Total amount will
                                                equal the base amount: {formatCurrency(previewTotalAmount)}
                                            </p>
                                        )}

                                        {baseAmountError && (
                                            <p className="candidate-base-amount-error" role="alert">
                                                {baseAmountError}
                                            </p>
                                        )}

                                        <div className="candidate-base-modal-actions">
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

                        {candidate.status !== "Blacklisted" && (
                            <div className="candidate-detail-schedule">
                                <button
                                    type="button"
                                    className="candidate-detail-schedule-btn"
                                    onClick={() =>
                                        navigate(`/consultancy/schedule-interview/${candidate.id}`)}>
                                    Schedule Interview
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </section>
    );
};
export default ViewCandidateDetail;