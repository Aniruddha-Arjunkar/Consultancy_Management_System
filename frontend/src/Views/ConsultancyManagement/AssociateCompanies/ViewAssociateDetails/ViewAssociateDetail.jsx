import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
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

const ViewAssociateDetails = () => {
    const { associateId } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                        <h1>Associate Details</h1>
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

    return (
        <section id="main-content">
            <div className="associate-details-page">
                <div className="associate-details-heading">
                    <div>
                        <h1>🤝 {company.companyName}</h1>
                        <p>Associate company details</p>
                    </div>
                    <Link
                        to="/consultancy/view-associate-company"
                        className="associate-back-button"
                    >
                        ← Back to Associates
                    </Link>
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
            </div>
        </section>
    );
};
export default ViewAssociateDetails;