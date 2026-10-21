import { useEffect, useMemo, useState } from "react";
import associateCompanyService from "../../../../services/associateCompanyService";
import "./ViewAssociateCompany.css";
import { useNavigate } from "react-router";

const detailFields = [
    ["Location", "location"],
    ["Working Domain", "workingDomain"],
    ["Working Technology", "workingTechnology"],
    ["Number of Employees", "noOfEmployee"],
    ["Contact Person", "contactPerson"],
    ["Mobile Number", "phone"],
    ["Email", "email"],
    ["Manager Name", "managerName"],
    ["Manager Phone", "managerPhone"],
    ["Manager Email", "managerEmail"],
    ["SLA Agreed", "slaAgreed"],
    ["Pay Package — Fresher", "payPackageFresher"],
    ["Pay Package — Experienced", "payPackageExperienced"],
    ["Pay for Fresher", "payForFresher"],
    ["Pay for Experienced", "payForExperienced"],
    ["GST Number", "gstNumber"],
    ["Shipping Address", "shippingAddress"],
    ["Invoice Number", "invoiceNumber"],
    ["Invoice Send Text", "invoiceSendText"],
    ["SLA Document", "slaDocument"],
];

const ViewAssociateCompany = () => {
    const [associates, setAssociates] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedAssociate, setSelectedAssociate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        let current = true;

        const loadAssociates = async () => {
            setLoading(true);
            setError("");

            try {
                const data =
                    await associateCompanyService.getAssociateCompanies();

                if (current) {
                    setAssociates(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (current) {
                    setError(
                        loadError.message ||
                        "Could not load associate companies."
                    );
                }
            } finally {
                if (current) setLoading(false);
            }
        };

        loadAssociates();

        return () => {
            current = false;
        };
    }, []);

    const filteredAssociates = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return associates;

        return associates.filter((company) =>
            [
                company.companyName,
                company.location,
                company.contactPerson,
                company.phone,
                company.email,
                company.slaAgreed,
            ]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query))
        );
    }, [associates, search]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page associate-list-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    🤝
                                </span>
                                View Associates
                            </h1>
                            <p className="view-clients-subtitle">
                                View and manage all associate companies
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {associates.length}{" "}
                            {associates.length === 1 ? "record" : "records"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-clients-filter">
                            <div className="view-client-search-wrap">
                                <span className="view-client-search-icon">
                                    🔍
                                </span>
                                <input
                                    type="search"
                                    className="view-client-search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search company, location, contact, mobile, email..."
                                    autoComplete="off"
                                    aria-label="Search associate companies"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <p className="associate-list-state">
                                Loading associate companies...
                            </p>
                        ) : error ? (
                            <p className="associate-list-state associate-list-error">
                                {error}
                            </p>
                        ) : (
                            <div className="view-clients-table-wrapper">
                                <table className="view-clients-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Company Name</th>
                                            <th>Location</th>
                                            <th>Contact Person</th>
                                            <th>Mobile No.</th>
                                            <th>Email</th>
                                            <th>SLA</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssociates.length > 0 ? (
                                            filteredAssociates.map(
                                                (company, index) => (
                                                    <tr key={company.id}>
                                                        <td>{index + 1}</td>
                                                        <td className="view-client-name" style={{ fontWeight: "600" }}>
                                                            {company.companyName}
                                                        </td>
                                                        <td>{company.location}</td>
                                                        <td>{company.contactPerson}</td>
                                                        <td>{company.phone}</td>
                                                        <td>{company.email}</td>
                                                        <td>
                                                            <span
                                                                className={`associate-sla-badge ${company.slaAgreed ===
                                                                        "YES"
                                                                        ? "agreed"
                                                                        : "not-agreed"
                                                                    }`}
                                                            >
                                                                {company.slaAgreed ||
                                                                    "NO"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="view-client-action-btn"
                                                                onClick={() =>
                                                                    navigate(`/consultancy/view-associate-details/${company.id}`)
                                                                }
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="view-client-no-data"
                                                >
                                                    {associates.length === 0
                                                        ? "No associate records found."
                                                        : "No matching associate companies found."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {selectedAssociate && (
                <div
                    className="associate-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedAssociate(null);
                        }
                    }}
                >
                    <section
                        className="associate-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="associate-modal-title"
                    >
                        <div className="associate-modal-header">
                            <div>
                                <h2 id="associate-modal-title">
                                    {selectedAssociate.companyName}
                                </h2>
                                <p>Associate company details</p>
                            </div>

                            <button
                                type="button"
                                className="associate-modal-close"
                                onClick={() => setSelectedAssociate(null)}
                                aria-label="Close associate details"
                            >
                                ×
                            </button>
                        </div>

                        <div className="associate-details-grid">
                            {detailFields.map(([label, field]) => (
                                <div
                                    className="associate-detail-field"
                                    key={field}
                                >
                                    <span>{label}</span>
                                    <strong>
                                        {selectedAssociate[field] || "—"}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </section>
    );
};
export default ViewAssociateCompany;