import { useEffect, useMemo, useState } from "react";
import "./GenerateLetter.css";
import employeesService from "../../../services/employeesService";

const GenerateLetter = () => {
    const [employees, setEmployees] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [letterType, setLetterType] = useState("");
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        let isMounted = true;

        employeesService
            .getEmployeesForLetter()
            .then((data) => {
                if (isMounted) {
                    setEmployees(Array.isArray(data) ? data : []);
                }
            })
            .catch((error) => {
                window.alert(error.message || "Could not load employees.");
            })
            .finally(() => {
                if (isMounted) {
                    setEmployeesLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredEmployees = useMemo(() => {
        const searchText = keyword.trim().toLowerCase();

        if (!searchText) {
            return [];
        }

        return employees.filter((employee) =>
            (employee.custName || "").toLowerCase().includes(searchText)
        );
    }, [employees, keyword]);

    const handleSearch = (event) => {
        event.preventDefault();

        if (employeesLoading) {
            window.alert("Please wait while employees are loading.");
            return;
        }

        setSelectedEmployeeId("");
        setLetterType("");
        setHasSearched(true);
    };

    const handleGenerate = async (event) => {
        event.preventDefault();

        if (!selectedEmployeeId) {
            window.alert("Select an employee.");
            return;
        }

        if (!letterType) {
            window.alert("Select a letter type.");
            return;
        }

        // Open the tab in the click handler so the browser does not block it.
        const pdfWindow = window.open("about:blank", "_blank");

        if (!pdfWindow) {
            window.alert("Allow pop-ups to open the generated letter.");
            return;
        }

        setGenerating(true);

        try {
            const pdfBlob = await employeesService.generateEmployeeLetter(
                selectedEmployeeId,
                letterType
            );

            const pdfUrl = URL.createObjectURL(pdfBlob);
            pdfWindow.location.href = pdfUrl;

            window.setTimeout(() => {
                URL.revokeObjectURL(pdfUrl);
            }, 60_000);

            window.alert("Letter generated and opened in a new tab.");
        } catch (error) {
            pdfWindow.close();
            window.alert(error.message || "Could not generate the letter.");
        } finally {
            setGenerating(false);
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
                                    <h2>Generate Employee Letter</h2>
                                    <p>
                                        Search employee and generate required letter
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="refollowup-form">
                            <form onSubmit={handleSearch}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Search Employee <span>*</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="keyword"
                                            placeholder="Search employee by name"
                                            value={keyword}
                                            onChange={(event) =>
                                                setKeyword(event.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div
                                        className="form-group"
                                        style={{
                                            flex: "0 0 150px",
                                            display: "flex",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            className="search-btn"
                                        >
                                            <i className="fa fa-search" />
                                            {" "}Search
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {hasSearched && filteredEmployees.length > 0 && (
                                <form
                                    className="refollowup-form"
                                    style={{ padding: 0, marginTop: 20 }}
                                    onSubmit={handleGenerate}
                                >
                                    <div className="form-group">
                                        <label>
                                            Select Employee <span>*</span>
                                        </label>

                                        <div className="employee-table-wrapper">
                                            <table className="employee-table">
                                                <thead>
                                                    <tr>
                                                        <th className="select-column">
                                                            Select
                                                        </th>
                                                        <th>Employee Name</th>
                                                        <th>Designation</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {filteredEmployees.map((employee) => (
                                                        <tr key={employee.id}>
                                                            <td className="select-column">
                                                                <input
                                                                    type="radio"
                                                                    name="employee_id"
                                                                    value={employee.id}
                                                                    checked={
                                                                        selectedEmployeeId ===
                                                                        String(employee.id)
                                                                    }
                                                                    onChange={() =>
                                                                        setSelectedEmployeeId(
                                                                            String(employee.id)
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                            </td>
                                                            <td>{employee.custName}</td>
                                                            <td>{employee.designation}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="letter-box">
                                        <div
                                            className="form-group"
                                            style={{ marginBottom: 0 }}
                                        >
                                            <label>
                                                Select Letter Type <span>*</span>
                                            </label>

                                            <select
                                                name="letter_type"
                                                value={letterType}
                                                onChange={(event) =>
                                                    setLetterType(event.target.value)
                                                }
                                                required
                                            >
                                                <option value="">
                                                    -- Select Letter --
                                                </option>
                                                <option value="offer">
                                                    Offer Letter
                                                </option>
                                                <option value="appointment">
                                                    Appointment Letter
                                                </option>
                                                <option value="relieving">
                                                    Relieving Letter
                                                </option>
                                                <option value="internship">
                                                    Internship Letter
                                                </option>
                                                <option value="experience">
                                                    Experience Letter
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={generating}
                                    >
                                        <i className="fa fa-file-pdf-o" />
                                        {" "}{generating
                                            ? "Generating..."
                                            : "Generate Letter"}
                                    </button>
                                </form>
                            )}

                            {hasSearched && filteredEmployees.length === 0 && (
                                <div className="alert alert-warning text-center">
                                    <i className="fa fa-exclamation-circle" />
                                    {" "}No employee found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};
export default GenerateLetter;