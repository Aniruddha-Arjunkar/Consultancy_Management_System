import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import API_BASE_URL from "../../../../services/api";
import associateCompanyService from "../../../../services/associateCompanyService";
import "../AddAssociateCompany/AddAssociateCompany.css";

const emptyForm = {
    companyName: "",
    location: "",
    workingDomain: "",
    workingTechnology: "",
    noOfEmployee: "",
    contactPerson: "",
    phone: "",
    email: "",
    managerName: "",
    managerPhone: "",
    managerEmail: "",
    payPackageFresher: "",
    payPackageExperienced: "",
    slaAgreed: "NO",
    payForFresher: "",
    payForExperienced: "",
    invoiceSendText: "",
};

const fieldRows = [
    [
        { name: "companyName", label: "Company Name", required: true },
        { name: "location", label: "Location", required: true },
    ],
    [
        { name: "workingDomain", label: "Working Domain", required: true },
        {
            name: "workingTechnology",
            label: "Working Technology",
            required: true,
        },
    ],
    [
        { name: "noOfEmployee", label: "No. of Employees", required: true },
        { name: "contactPerson", label: "Contact Person", required: true },
    ],
    [
        {
            name: "phone",
            label: "Mobile Number",
            type: "tel",
            required: true,
        },
        {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
        },
    ],
    [
        { name: "managerName", label: "Manager Name" },
        { name: "managerPhone", label: "Manager Phone", type: "tel" },
    ],
];

const UpdateAssociateCompany = () => {
    const { associateId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [currentSlaDocument, setCurrentSlaDocument] = useState("");
    const [slaDocument, setSlaDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let active = true;

        const loadCompany = async () => {
            setLoading(true);
            setLoadError("");

            try {
                const company =
                    await associateCompanyService.getAssociateCompanyById(
                        associateId
                    );

                if (!active) return;

                setForm({
                    companyName: company.companyName || "",
                    location: company.location || "",
                    workingDomain: company.workingDomain || "",
                    workingTechnology: company.workingTechnology || "",
                    noOfEmployee: company.noOfEmployee || "",
                    contactPerson: company.contactPerson || "",
                    phone: company.phone || "",
                    email: company.email || "",
                    managerName: company.managerName || "",
                    managerPhone: company.managerPhone || "",
                    managerEmail: company.managerEmail || "",
                    payPackageFresher: company.payPackageFresher || "",
                    payPackageExperienced:
                        company.payPackageExperienced || "",
                    slaAgreed: (company.slaAgreed || "NO").toUpperCase(),
                    payForFresher: company.payForFresher || "",
                    payForExperienced: company.payForExperienced || "",
                    invoiceSendText: company.invoiceSendText || "",
                });

                setInvoiceNumber(company.invoiceNumber || "");
                setCurrentSlaDocument(company.slaDocument || "");
            } catch (error) {
                if (active) {
                    setLoadError(
                        error.message || "Could not load associate details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadCompany();

        return () => {
            active = false;
        };
    }, [associateId]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => {
            const updated = { ...current, [name]: value };

            if (name === "slaAgreed" && value === "NO") {
                updated.payForFresher = "";
                updated.payForExperienced = "";
            }

            return updated;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        const formData = new FormData();

        Object.entries(form).forEach(([name, value]) => {
            formData.append(name, value);
        });

        if (slaDocument) {
            formData.append("slaDocument", slaDocument);
        }

        try {
            await associateCompanyService.updateAssociateCompany(
                associateId,
                formData
            );

            window.alert("Associate company updated successfully ✅.");
            navigate(
                `/consultancy/view-associate-details/${associateId}`
            );
        } catch (error) {
            window.alert(
                error.message || "Could not update associate company ❌."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section id="main-content">
                <section className="add-associate-page">
                    <p>Loading associate details...</p>
                </section>
            </section>
        );
    }

    if (loadError) {
        return (
            <section id="main-content">
                <section className="add-associate-page">
                    <p>{loadError}</p>
                    <Link to={`/consultancy/view-associate-details/${associateId}`}>
                        Back to Associate Details
                    </Link>
                </section>
            </section>
        );
    }

    const renderField = ({ name, label, type = "text", required = false }) => (
        <div className="form-group" key={name}>
            <label htmlFor={name}>
                {label} {required && <span>*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required={required}
            />
        </div>
    );

    return (
        <section id="main-content">
            <section className="add-associate-page update-associate-page">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">🏢</span>
                                <div>
                                    <h2>Update Associate</h2>
                                    <p>Update associate company details</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            {fieldRows.map((row, index) => (
                                <div className="form-row" key={index}>
                                    {row.map(renderField)}
                                </div>
                            ))}

                            <div className="form-group">
                                <label htmlFor="managerEmail">
                                    Manager Email
                                </label>
                                <input
                                    id="managerEmail"
                                    name="managerEmail"
                                    type="email"
                                    value={form.managerEmail}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-row">
                                {renderField({
                                    name: "payPackageFresher",
                                    label: "Pay Package Fresher",
                                    required: true,
                                })}
                                {renderField({
                                    name: "payPackageExperienced",
                                    label: "Pay Package Experienced",
                                    required: true,
                                })}
                            </div>

                            <div className="form-group">
                                <label htmlFor="slaAgreed">SLA Agreed</label>
                                <select
                                    id="slaAgreed"
                                    name="slaAgreed"
                                    value={form.slaAgreed}
                                    onChange={handleChange}
                                >
                                    <option value="YES">Yes</option>
                                    <option value="NO">No</option>
                                </select>
                            </div>

                            {form.slaAgreed === "YES" && (
                                <div className="form-row">
                                    {renderField({
                                        name: "payForFresher",
                                        label: "Pay For Fresher",
                                    })}
                                    {renderField({
                                        name: "payForExperienced",
                                        label: "Pay For Experienced",
                                    })}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="invoiceNumber">
                                    Invoice Number
                                </label>
                                <input
                                    id="invoiceNumber"
                                    value={invoiceNumber || "Not assigned"}
                                    readOnly
                                />
                                {/* <small>
                                    Invoice number is read-only and is not
                                    changed by this form.
                                </small> */}
                            </div>

                            <div className="form-group">
                                <label htmlFor="slaDocument">
                                    Replace SLA Document (optional)
                                </label>

                                {currentSlaDocument && (
                                    <p>
                                        Current document:{" "}
                                        <a
                                            href={`${API_BASE_URL}/associate-companies/${encodeURIComponent(
                                                associateId
                                            )}/sla-document`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View current SLA
                                        </a>
                                    </p>
                                )}

                                <input
                                    id="slaDocument"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                    onChange={(event) =>
                                        setSlaDocument(
                                            event.target.files?.[0] || null
                                        )
                                    }
                                />
                                <small>
                                    Leave empty to keep the current document.
                                    PDF, DOC, DOCX, JPG, or PNG; maximum 10 MB.
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="invoiceSendText">
                                    Invoice Send Text
                                </label>
                                <input
                                    id="invoiceSendText"
                                    name="invoiceSendText"
                                    value={form.invoiceSendText}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-row">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Updating..."
                                        : "💾 Update Associate"}
                                </button>

                                <button
                                    type="button"
                                    className="submit-btn"
                                    disabled={submitting}
                                    onClick={() =>
                                        navigate(
                                            `/consultancy/view-associate-details/${associateId}`
                                        )
                                    }
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default UpdateAssociateCompany;