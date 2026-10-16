import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import employeesService from "../../../services/employeesService";

const emptyForm = {
    resignationType: "With Notice",
    resignationDate: "",
    noticePeriod: "",
    releaseDate: "",
    reasonForLeaving: "",
    abscondDate: "",
};

const EmployeeResignation = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadEmployee = async () => {
            try {
                const data =
                    await employeesService.getEmployeeById(employeeId);

                setEmployee(data);
                setForm({
                    resignationType:
                        data.resignationType || "With Notice",
                    resignationDate: data.resignationDate || "",
                    noticePeriod: data.noticePeriod || "",
                    releaseDate: data.releaseDate || "",
                    reasonForLeaving: data.reasonForLeaving || "",
                    abscondDate: data.abscondDate || "",
                });
            } catch (error) {
                window.alert(error.message || "Could not load employee.");
                navigate(`/employee/view-employee-detail/${employeeId}`);
            } finally {
                setLoading(false);
            }
        };

        loadEmployee();
    }, [employeeId, navigate]);

    const handleTypeChange = (event) => {
        const resignationType = event.target.value;

        setForm((previous) => ({
            ...previous,
            resignationType,
            ...(resignationType === "With Notice"
                ? { abscondDate: "" }
                : {}),
            ...(resignationType === "Without Notice"
                ? { noticePeriod: "", abscondDate: "" }
                : {}),
            ...(resignationType === "Abscond"
                ? {
                    resignationDate: "",
                    noticePeriod: "",
                    releaseDate: "",
                }
                : {}),
        }));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const resignationData = {
            resignationType: form.resignationType,
            resignationDate:
                form.resignationType === "Abscond"
                    ? null
                    : form.resignationDate || null,
            noticePeriod:
                form.resignationType === "With Notice"
                    ? form.noticePeriod || null
                    : null,
            releaseDate:
                form.resignationType === "Abscond"
                    ? null
                    : form.releaseDate || null,
            reasonForLeaving: form.reasonForLeaving.trim(),
            abscondDate:
                form.resignationType === "Abscond"
                    ? form.abscondDate || null
                    : null,
        };

        setSubmitting(true);

        try {
            await employeesService.processEmployeeResignation(
                employeeId,
                resignationData
            );

            window.alert(
                "Employee resignation processed successfully."
            );
            navigate(`/employee/view-employee-detail/${employeeId}`);
        } catch (error) {
            window.alert(
                error.message || "Could not process the resignation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="reg-w3">Loading employee details...</div>
                </section>
            </section>
        );
    }

    if (!employee) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="reg-w3">Employee not found.</div>
                </section>
            </section>
        );
    }

    const isAbscond = form.resignationType === "Abscond";
    const hasNotice = form.resignationType === "With Notice";

    return (
        <section id="main-content">
            <section className="">
                <div className="reg-w3">
                    <div className="refollowup-card">
                        <div className="refollowup-header">
                            <div className="refollowup-title">
                                <span className="phone-icon">📞</span>
                                <div>
                                    <h2>Process Employee Resignation</h2>
                                    <p>
                                        {employee.title} {employee.custName}
                                        {" — Employee ID: "}
                                        {employee.empId || employee.id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form
                            className="refollowup-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="resignationType">
                                        Resignation Type
                                    </label>
                                    <select
                                        id="resignationType"
                                        name="resignationType"
                                        value={form.resignationType}
                                        onChange={handleTypeChange}
                                        required
                                    >
                                        <option value="With Notice">
                                            With Notice
                                        </option>
                                        <option value="Without Notice">
                                            Without Notice
                                        </option>
                                        <option value="Abscond">
                                            Abscond
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {isAbscond ? (
                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label htmlFor="abscondDate">
                                            Abscond Date
                                        </label>
                                        <input
                                            type="date"
                                            id="abscondDate"
                                            name="abscondDate"
                                            value={form.abscondDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="form-row">
                                        <div className="form-group full-width">
                                            <label htmlFor="resignationDate">
                                                Resignation Date
                                            </label>
                                            <input
                                                type="date"
                                                id="resignationDate"
                                                name="resignationDate"
                                                value={form.resignationDate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {hasNotice && (
                                        <div className="form-row">
                                            <div className="form-group full-width">
                                                <label htmlFor="noticePeriod">
                                                    Notice Period (Last Working Day)
                                                </label>
                                                <input
                                                    type="date"
                                                    id="noticePeriod"
                                                    name="noticePeriod"
                                                    value={form.noticePeriod}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-row">
                                        <div className="form-group full-width">
                                            <label htmlFor="releaseDate">
                                                Release Date
                                            </label>
                                            <input
                                                type="date"
                                                id="releaseDate"
                                                name="releaseDate"
                                                value={form.releaseDate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="reasonForLeaving">
                                        Reason for Leaving
                                    </label>
                                    <textarea
                                        id="reasonForLeaving"
                                        name="reasonForLeaving"
                                        rows="4"
                                        value={form.reasonForLeaving}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={submitting}
                                    >
                                        📤{" "}
                                        {submitting
                                            ? "Submitting..."
                                            : "Submit Resignation"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default EmployeeResignation;