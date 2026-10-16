import API_BASE_URL from "../../../services/api";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import employeesService from "../../../services/employeesService";
import "./ViewEmployeeDetail.css";

const DetailField = ({ label, value, full = false }) => (
    <div className={full ? "field full" : "field"}>
        <label>{label}</label>
        <div className="field-value">{value || "—"}</div>
    </div>
);

const DetailCard = ({ title, fields }) => (
    <div className="card">
        <div className="section-title">{title}</div>
        <div className="field-grid">
            {fields.map(([label, value, full]) => (
                <DetailField
                    key={label}
                    label={label}
                    value={value}
                    full={full}
                />
            ))}
        </div>
    </div>
);

const ViewEmployeeDetail = () => {
    const { employeeId } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photoFailed, setPhotoFailed] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [documentsLoading, setDocumentsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const loadEmployee = async () => {
            try {
                const data =
                    await employeesService.getEmployeeById(employeeId);
                setEmployee(data);
            } catch (error) {
                window.alert(error.message || "Could not load employee.");
            } finally {
                setLoading(false);
            }
        };

        loadEmployee();
    }, [employeeId]);

    useEffect(() => {
        const loadDocuments = async () => {
            try {
                const data =
                    await employeesService.getEmployeeDocuments(employeeId);
                setDocuments(data);
            } catch (error) {
                window.alert(error.message || "Could not load employee documents.");
            } finally {
                setDocumentsLoading(false);
            }
        };

        loadDocuments();
    }, [employeeId]);

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="employee-container">Loading employee...</div>
                </section>
            </section>
        );
    }

    if (!employee) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="employee-container">
                        <div className="page-header">
                            <div className="page-title">Employee not found</div>
                            <Link to="/employee/view-employee" className="back-btn">
                                ← Back
                            </Link>
                        </div>
                    </div>
                </section>
            </section>
        );
    }

    const personalFields = [
        ["Phone", employee.custPhone],
        ["Email", employee.custEmail],
        ["Alternate Phone", employee.custAlternate],
        ["Relationship", employee.alternatePhoneRelation],
        ["Mother Name", employee.motherName],
        ["DOB", employee.dob],
        ["Gender", employee.gender],
        ["Marital Status", employee.maritalStatus],
        ...(employee.maritalStatus === "Married"
            ? [
                ["Spouse Name", employee.spouseName],
                ["Spouse Occupation", employee.spouseOccupation],
            ]
            : []),
        ["Current Address", employee.custAddress1, true],
        ["Permanent Address", employee.custAddress2, true],
    ];

    const experienceFields = [
        ["Experience / Fresher", employee.experienceFresher],
        ["Work Experience", employee.workExperienceYears],
        ["Previous Company", employee.previousCompanyName],
        ["Previous Designation", employee.previousDesignation],
        ["Previous Job Salary", employee.previousJobSalary],
        ["Previous Experience", employee.previousExperience],
    ];

    const employmentFields = [
        ["Department", employee.department],
        ["Employee Type", employee.employeeType],
        ["Joining Date", employee.joiningDate],
        ["Designation", employee.designation],
        ["Salary", employee.packageName],
        ["Qualification", employee.qualification],
        ["Branch", employee.branch],
    ];

    const resignationFields = [
        ["Resignation Type", employee.resignationType],
        ["Resignation Date", employee.resignationDate],
        ["Notice Period", employee.noticePeriod],
        ["Release Date", employee.releaseDate],
        ["Abscond Date", employee.abscondDate],
        ["Reason for Leaving", employee.reasonForLeaving, true],
    ];

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="employee-container">
                    <div className="page-header">
                        <div className="page-title">👤 Employee Details</div>

                        <Link to="/employee/view-employee" className="back-btn">
                            ← Back
                        </Link>
                    </div>

                    <div className="profile-card">
                        {employee.photo && !photoFailed ? (
                            <img
                                className="profile-photo"
                                src={`${API_BASE_URL}/employees/${employee.id}/photo`}
                                alt="Employee"
                                onError={() => setPhotoFailed(true)}
                            />
                        ) : (
                            <div className="profile-photo">👤</div>
                        )}

                        <div className="profile-info">
                            <h2>
                                {[employee.title, employee.custName]
                                    .filter(Boolean)
                                    .join(" ")}
                            </h2>
                            <p className="designation">
                                {employee.designation || "—"}
                            </p>
                            <p>Employee ID: {employee.empId || "—"}</p>
                        </div>
                    </div>

                    <div className="columns">
                        <div className="column">
                            <DetailCard
                                title="Personal Information"
                                fields={personalFields}
                            />

                            <DetailCard
                                title="Experience"
                                fields={experienceFields}
                            />

                            <DetailCard
                                title="KYC Details"
                                fields={[
                                    ["Aadhaar No", employee.adharNo],
                                    ["PAN Card", employee.panCardNo],
                                ]}
                            />
                        </div>

                        <div className="column">
                            <DetailCard
                                title="Educational Details"
                                fields={[
                                    ["10th", employee.education10th],
                                    ["12th", employee.education12th],
                                    ["Graduation", employee.educationGraduation],
                                    ["Post Graduation", employee.educationPostgrad],
                                ]}
                            />

                            <DetailCard
                                title="Employment Details"
                                fields={employmentFields}
                            />



                            <DetailCard
                                title="Bank Details"
                                fields={[
                                    ["Account No", employee.accountNo],
                                    ["Bank Name", employee.bankName],
                                    ["Branch", employee.branchName],
                                    ["IFSC", employee.ifscCode],
                                ]}
                            />

                            <DetailCard
                                title="Provident Fund and ESIC Details"
                                fields={[
                                    ["UAN No", employee.pfUan],
                                    ["PF No", employee.pfNumber],
                                    ["ESIC No", employee.esicNumber],
                                ]}
                            />

                            {(employee.resignationType ||
                                employee.resignationDate ||
                                employee.abscondDate) && (
                                    <DetailCard
                                        title="Resignation Details"
                                        fields={resignationFields}
                                    />
                                )}
                        </div>
                    </div>

                    <div className="actions-card">
                        <div className="actions-title">Employee Actions</div>

                        <div className="action-buttons">
                            <button type="button" className="btn-attendance">
                                ✓&nbsp; View Attendance
                            </button>
                            <button type="button" className="btn-salary">
                                ₹&nbsp; View Salary
                            </button>
                            <button
                                type="button"
                                className="btn-upload"
                                onClick={() =>
                                    navigate(`/employee/${employeeId}/upload-document`)
                                }
                            >
                                ↑&nbsp; Upload Document
                            </button>
                            <button
                                type="button"
                                className="btn-update"
                                onClick={() =>
                                    navigate(`/employee/${employeeId}/update-employee`)
                                }
                            >
                                ✎&nbsp; Update Profile
                            </button>
                            <button type="button" className="btn-resignation">
                                ⚠&nbsp; Resignation
                            </button>
                        </div>
                    </div>

                    <div className="documents-card">
                        <div className="section-title">View Documents</div>
                        <div className="no-document">
                            {documentsLoading ? (
                                <div className="no-document">Loading documents...</div>
                            ) : documents.length === 0 ? (
                                <div className="no-document">No documents uploaded.</div>
                            ) : (
                                documents.map((document) => (
                                    <div className="document-row" key={document.id}>
                                        <span className="document-type">
                                            {document.documentType}:
                                        </span>

                                        <span>{document.documentName}</span>

                                        <a
                                            className="document-link"
                                            href={`${API_BASE_URL}/employees/${encodeURIComponent(employeeId)}/documents/${encodeURIComponent(document.id)}/file`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View PDF
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default ViewEmployeeDetail;