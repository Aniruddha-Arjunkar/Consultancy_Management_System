import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import employeesService from "../../../services/employeesService";

const UploadEmployeeDocument = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const [documentType, setDocumentType] = useState("");
    const [document, setDocument] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!documentType.trim()) {
            window.alert("Enter the document type.");
            return;
        }

        if (!document) {
            window.alert("Select a PDF document.");
            return;
        }

        const formData = new FormData();
        formData.append("documentType", documentType.trim());
        formData.append("document", document);

        try {
            setSubmitting(true);
            await employeesService.uploadEmployeeDocument(
                employeeId,
                formData
            );

            window.alert("Document uploaded successfully.");
            navigate(`/employee/view-employee-detail/${employeeId}`);
        } catch (error) {
            window.alert(error.message || "Could not upload the document.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="main-content">
            <section className="">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">📄</span>
                                <div>
                                    <h2>Upload Employee Document</h2>
                                    <p>Upload PDF Document Only</p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="documentType">
                                        Document Type
                                    </label>
                                    <input
                                        id="documentType"
                                        type="text"
                                        placeholder="Enter document type"
                                        value={documentType}
                                        onChange={(event) =>
                                            setDocumentType(event.target.value)
                                        }
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="document">
                                        Select PDF Document
                                    </label>
                                    <input
                                        id="document"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={(event) =>
                                            setDocument(
                                                event.target.files?.[0] || null
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={submitting}
                            >
                                {submitting ? "Uploading..." : "Upload Document"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default UploadEmployeeDocument;