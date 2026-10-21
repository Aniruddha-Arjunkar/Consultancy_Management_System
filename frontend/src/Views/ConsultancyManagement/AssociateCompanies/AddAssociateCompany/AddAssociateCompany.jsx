import { useState, useRef } from "react";
import associateCompanyService from "../../../../services/associateCompanyService";
import "./AddAssociateCompany.css";

const initialForm = {
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
    slaAgreed: "YES",
    payForFresher: "",
    payForExperienced: "",
    invoiceSendText: "",
};

const AddAssociateCompany = () => {
    const [form, setForm] = useState(initialForm);
    const [slaDocument, setSlaDocument] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const slaDocumentInputRef = useRef(null);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
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
            const result = await associateCompanyService.createAssociateCompany(formData);

            window.alert("Associate company added successfully ✅.");

            setForm(initialForm);
            setSlaDocument(null);

            if (slaDocumentInputRef.current) {
                slaDocumentInputRef.current.value = "";
            }

        } catch (submitError) {
            window.alert(submitError.message || "Could not add the associate company ❌.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="main-content">
            <section className="add-associate-page">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">🏢</span>
                                <div>
                                    <h2>Associate Companies</h2>
                                    <p>Add associate company details</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="form-group">
                                <label htmlFor="companyName">
                                    Company Name <span>*</span>
                                </label>
                                <input
                                    id="companyName"
                                    name="companyName"
                                    value={form.companyName}
                                    onChange={handleChange}
                                    placeholder="Company name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">
                                    Location <span>*</span>
                                </label>
                                <input
                                    id="location"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="City / location"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="workingDomain">
                                        Working Domain <span>*</span>
                                    </label>
                                    <input
                                        id="workingDomain"
                                        name="workingDomain"
                                        value={form.workingDomain}
                                        onChange={handleChange}
                                        placeholder="e.g. IT, Finance"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="workingTechnology">
                                        Working Technology <span>*</span>
                                    </label>
                                    <input
                                        id="workingTechnology"
                                        name="workingTechnology"
                                        value={form.workingTechnology}
                                        onChange={handleChange}
                                        placeholder="Technologies used"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="noOfEmployee">
                                        No. of Employees <span>*</span>
                                    </label>
                                    <input
                                        id="noOfEmployee"
                                        name="noOfEmployee"
                                        value={form.noOfEmployee}
                                        onChange={handleChange}
                                        placeholder="Number of employees"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="contactPerson">
                                        Contact Person <span>*</span>
                                    </label>
                                    <input
                                        id="contactPerson"
                                        name="contactPerson"
                                        value={form.contactPerson}
                                        onChange={handleChange}
                                        placeholder="Contact person"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">
                                        Mobile Number <span>*</span>
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        maxLength="21"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Mobile number"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        Email <span>*</span>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="managerName">
                                        Manager Name
                                    </label>
                                    <input
                                        id="managerName"
                                        name="managerName"
                                        value={form.managerName}
                                        onChange={handleChange}
                                        placeholder="Manager name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="managerPhone">
                                        Manager Phone
                                    </label>
                                    <input
                                        id="managerPhone"
                                        name="managerPhone"
                                        type="tel"
                                        maxLength="20"
                                        value={form.managerPhone}
                                        onChange={handleChange}
                                        placeholder="Manager phone"
                                    />
                                </div>
                            </div>

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
                                    placeholder="manager@company.com"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="payPackageFresher">
                                        Pay Package Fresher <span>*</span>
                                    </label>
                                    <input
                                        id="payPackageFresher"
                                        name="payPackageFresher"
                                        value={form.payPackageFresher}
                                        onChange={handleChange}
                                        placeholder="Package amount / terms"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="payPackageExperienced">
                                        Pay Package Experienced <span>*</span>
                                    </label>
                                    <input
                                        id="payPackageExperienced"
                                        name="payPackageExperienced"
                                        value={form.payPackageExperienced}
                                        onChange={handleChange}
                                        placeholder="Package amount / terms"
                                        required
                                    />
                                </div>
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
                                    <div className="form-group">
                                        <label htmlFor="payForFresher">
                                            Pay For Fresher
                                        </label>
                                        <input
                                            id="payForFresher"
                                            name="payForFresher"
                                            value={form.payForFresher}
                                            onChange={handleChange}
                                            placeholder="Pay for fresher"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="payForExperienced">
                                            Pay For Experienced
                                        </label>
                                        <input
                                            id="payForExperienced"
                                            name="payForExperienced"
                                            value={form.payForExperienced}
                                            onChange={handleChange}
                                            placeholder="Pay for experienced"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="slaDocument">
                                    Upload SLA Document
                                </label>
                                <input
                                    ref={slaDocumentInputRef}
                                    id="slaDocument"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                    onChange={(event) =>
                                        setSlaDocument(event.target.files?.[0] || null)
                                    }
                                />
                                <small>PDF, DOC, DOCX, JPG, or PNG; maximum 10 MB.</small>
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
                                    placeholder="Optional invoice note"
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : "🏢 Add Associate"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default AddAssociateCompany;