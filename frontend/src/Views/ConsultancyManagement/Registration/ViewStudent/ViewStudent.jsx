import { useEffect, useMemo, useState } from "react";
import studentRegistrationService from "../../../../services/studentRegistrationService";
import "./ViewStudent.css";
import { useNavigate } from "react-router";



const ViewStudent = () => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingStudentId, setDeletingStudentId] = useState(null);


    const handleDelete = async (student) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${student.name || "this student"}'s registration?`
        );

        if (!confirmed) return;

        setDeletingStudentId(student.id);

        try {
            await studentRegistrationService.deleteStudent(student.id);

            setStudents((currentStudents) =>
                currentStudents.filter(
                    (item) => String(item.id) !== String(student.id)
                )
            );
        } catch (deleteError) {
            window.alert(
                deleteError.message || "Could not delete the student record."
            );
        } finally {
            setDeletingStudentId(null);
        }
    };


    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        const loadStudents = async () => {
            try {
                const data = await studentRegistrationService.getStudents();

                if (active) {
                    setStudents(Array.isArray(data) ? data : []);
                }
            } catch (loadError) {
                if (active) {
                    const message =
                        loadError.message || "Could not load student records.";
                    setError(message);
                    window.alert(message);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadStudents();

        return () => {
            active = false;
        };
    }, []);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return students;

        return students.filter((student) =>
            [
                student.name,
                student.phone,
                student.address,
                student.graduation,
                student.skills,
                student.experience,
                student.jobProfile,
            ]
                .filter((value) => value !== null && value !== undefined)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [students, search]);

    return (
        <section id="main-content">
            <section className="wrapper">
                <div className="view-clients-page">
                    <div className="view-clients-header">
                        <div className="view-clients-title-wrap">
                            <h1 className="view-clients-title">
                                <span className="view-clients-title-icon">
                                    🎓
                                </span>
                                Students Details
                            </h1>

                            <p className="view-clients-subtitle">
                                View and manage all student records
                            </p>
                        </div>

                        <span className="view-clients-count">
                            {students.length}{" "}
                            {students.length === 1 ? "record" : "records"}
                        </span>
                    </div>

                    <div className="view-clients-card">
                        <div className="view-clients-filter">
                            <div className="view-client-search-wrap" style={{ marginBottom: '10px' }}>
                                <span className="view-client-search-icon">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    className="view-client-search"
                                    placeholder="Search name, mobile, city, skills..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    autoComplete="off"
                                    aria-label="Search students"
                                />
                            </div>
                        </div>

                        {loading && <p>Loading students...</p>}

                        {!loading && error && <p>{error}</p>}

                        {!loading && !error && (
                            <div className="view-clients-table-wrapper">
                                <table className="view-clients-table">
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Name</th>
                                            <th>Mobile No.</th>
                                            <th>Address</th>
                                            <th>Graduation</th>
                                            <th>Skills</th>
                                            <th>Experience</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map(
                                                (student, index) => (
                                                    <tr key={student.id}>
                                                        <td>{index + 1}</td>
                                                        <td className="view-client-name" style={{ fontWeight: '700' }}>
                                                            {student.name || "—"}
                                                        </td>
                                                        <td>
                                                            {student.phone || "—"}
                                                        </td>
                                                        <td>
                                                            {student.address || "—"}
                                                        </td>
                                                        <td>
                                                            {student.graduation || "—"}
                                                        </td>
                                                        <td>
                                                            {student.skills || "—"}
                                                        </td>
                                                        <td>
                                                            {student.experience || "—"}
                                                        </td>
                                                        <td>
                                                            <div className="requirement-action-buttons">
                                                                <button
                                                                    type="button"
                                                                    className="view-client-view-btn"
                                                                    onClick={() =>
                                                                        navigate(`/consultancy/view-student-detail/${student.id}`)
                                                                    }>
                                                                    View
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="view-client-defaulter-btn"
                                                                    onClick={() => handleDelete(student)}
                                                                    disabled={String(deletingStudentId) === String(student.id)}
                                                                >
                                                                    {String(deletingStudentId) === String(student.id)
                                                                        ? "Deleting..."
                                                                        : "Delete"}
                                                                </button>
                                                            </div>
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
                                                    {students.length === 0
                                                        ? "No student records found."
                                                        : "No matching students found."}
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
        </section>
    );
};
export default ViewStudent;