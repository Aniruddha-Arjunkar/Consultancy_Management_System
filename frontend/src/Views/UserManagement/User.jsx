import { useCallback, useEffect, useMemo, useState } from "react";
import usersService from "../../services/usersService";
import "./User.css";

const INITIAL_FORM = {
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "",
    branch: "",
};

// const MODULE_GROUPS = [
//     {
//         id: "accountsBox",
//         title: "Accounts",
//         parent: "ACCOUNTS",
//         options: [
//             { label: "All Account", value: "ACCOUNTS" },
//             { label: "Payments View", value: "ACCOUNTS:PAYMENTS_VIEW" },
//             // { label: "Payments Due (All)", value: "ACCOUNTS:PAYMENTS_DUE" },
//             {
//                 label: "Payments Due",
//                 value: "CONSULTANCY:PAYMENTS_DUE",
//             },
//             {
//                 label: "Defaulter",
//                 value: "ACCOUNTS:PAYMENTS_DEFAULTER",
//             },
//             { label: "GST Generate", value: "ACCOUNTS:GST_GENERATE" },
//             { label: "GST View", value: "ACCOUNTS:GST_VIEW" },
//             {
//                 label: "Expenses Add/View",
//                 value: "ACCOUNTS:EXPENSES",
//             },
//             {
//                 label: "Advance View/Add",
//                 value: "ACCOUNTS:ADVANCE",
//             },
//             {
//                 label: "TDS Due/paid",
//                 value: "ACCOUNTS:TDS",
//             }
//         ],
//     },
//     {
//         id: "employeeBox",
//         title: "Employee Management",
//         parent: "EMPLOYEE",
//         options: [
//             { label: "ALL Employee", value: "EMPLOYEE" },
//             { label: "Add Employee", value: "EMPLOYEE:ADD" },
//             { label: "View Employee", value: "EMPLOYEE:VIEW" },
//             { label: "Add Salary", value: "EMPLOYEE:ADD_SALARY" },
//         ],
//     },
//     {
//         id: "attendanceBox",
//         title: "Attendance Management",
//         parent: "ATTENDANCE",
//         options: [
//             { label: "Attendance", value: "ATTENDANCE" },
//         ],
//     },
//     {
//         id: "consultantBox",
//         title: "Consultancy Modules",
//         parent: "CONSULTANCY",
//         options: [
//             { label: "Consultancy", value: "CONSULTANCY" },
//         ],
//     },
// ];

const MODULE_GROUPS = [
    {
        id: "accountsBox",
        title: "Accounts",
        parent: "ACCOUNTS",
        options: [
            { label: "All Accounts", value: "ACCOUNTS" },
            { label: "Payments View", value: "ACCOUNTS:PAYMENTS_VIEW" },
            { label: "Payments Due", value: "ACCOUNTS:PAYMENTS_DUE" },
            { label: "Payment Defaulters", value: "ACCOUNTS:PAYMENTS_DEFAULTER" },
            { label: "Generate GST Invoice", value: "ACCOUNTS:GST_GENERATE" },
            { label: "View GST Invoices", value: "ACCOUNTS:GST_VIEW" },
            { label: "Add Expenses", value: "ACCOUNTS:EXPENSES_ADD" },
            { label: "View Expenses", value: "ACCOUNTS:EXPENSES_VIEW" },
            { label: "Add Advance", value: "ACCOUNTS:ADVANCE_ADD" },
            { label: "View Advance", value: "ACCOUNTS:ADVANCE_VIEW" },
            { label: "Due TDS", value: "ACCOUNTS:TDS_DUE" },
            { label: "Paid TDS", value: "ACCOUNTS:TDS_PAID" },
        ],
    },
    {
        id: "employeeBox",
        title: "Employee Management",
        parent: "EMPLOYEE",
        options: [
            { label: "All Employee Pages", value: "EMPLOYEE" },
            { label: "Add Employee", value: "EMPLOYEE:ADD" },
            { label: "View Employee", value: "EMPLOYEE:VIEW" },
            { label: "Generate Letter", value: "EMPLOYEE:GENERATE_LETTER" },
            { label: "Add Salary", value: "EMPLOYEE:ADD_SALARY" },
        ],
    },
    {
        id: "attendanceBox",
        title: "Attendance Management",
        parent: "ATTENDANCE",
        options: [
            { label: "All Attendance Pages", value: "ATTENDANCE" },
            { label: "Add Attendance", value: "ATTENDANCE:ADD" },
            { label: "View Attendance", value: "ATTENDANCE:VIEW" },
        ],
    },
    {
        id: "consultantBox",
        title: "Consultancy Modules",
        parent: "CONSULTANCY",
        options: [
            { label: "All Consultancy Pages", value: "CONSULTANCY" },
            { label: "Consultancy Payments Due", value: "CONSULTANCY:PAYMENTS_DUE" },
            { label: "Add Associate Company", value: "CONSULTANCY:ASSOCIATE_COMPANY_ADD" },
            { label: "View Associate Companies", value: "CONSULTANCY:ASSOCIATE_COMPANY_VIEW" },
            { label: "Add Current Requirement", value: "CONSULTANCY:REQUIREMENT_ADD" },
            { label: "View Requirements", value: "CONSULTANCY:REQUIREMENT_VIEW" },
            { label: "Closed Requirements", value: "CONSULTANCY:REQUIREMENT_CLOSED" },
            { label: "Add Student", value: "CONSULTANCY:STUDENT_ADD" },
            { label: "View Students", value: "CONSULTANCY:STUDENT_VIEW" },
            { label: "All Candidates", value: "CONSULTANCY:CANDIDATES_VIEW" },
            { label: "Interview Schedule", value: "CONSULTANCY:INTERVIEW_SCHEDULE" },
            { label: "Placed Candidates", value: "CONSULTANCY:PLACED_CANDIDATES" },
            { label: "Rejected Candidates", value: "CONSULTANCY:REJECTED_CANDIDATES" },
        ],
    },
];

const normalizeRole = (role) =>
    role?.trim().toUpperCase() || "";

const getModulesFromUser = (accessModules) => {
    if (!accessModules) {
        return [];
    }

    return accessModules
        .split(",")
        .map((module) => module.trim().toUpperCase())
        .filter(Boolean);
};

function User() {
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState(INITIAL_FORM);
    const [selectedModules, setSelectedModules] = useState([]);

    const [openMenus, setOpenMenus] = useState({});

    const [saving, setSaving] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await usersService.getAllUsers();

            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.message || "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) {
            return users;
        }

        return users.filter((user) => {
            const searchableValues = [
                user.name,
                user.phone,
                user.email,
                user.role,
                user.branch,
                user.accessModules,
            ];

            return searchableValues.some((value) =>
                String(value ?? "")
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [users, searchTerm]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const openCreateUserModal = () => {
        setEditingUser(null);
        setForm({ ...INITIAL_FORM });
        setSelectedModules([]);
        setOpenMenus({});
        setError("");
        setSuccess("");
        setShowPassword(false);
        setModalOpen(true);
    };

    const openEditUserModal = (user) => {
        setEditingUser(user);

        setForm({
            name: user.name || "",
            phone: user.phone || "",
            email: user.email || "",
            password: "",
            role: normalizeRole(user.role),
            branch: user.branch || "",
        });

        setSelectedModules(
            getModulesFromUser(user.accessModules)
        );

        setOpenMenus({});
        setError("");
        setSuccess("");
        setModalOpen(true);
        setShowPassword(false);
    };

    const closeCreateUserModal = () => {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setShowPassword(false);
        setEditingUser(null);
        setForm({ ...INITIAL_FORM });
        setSelectedModules([]);
    };

    const toggleMenu = (menuId) => {
        setOpenMenus((previous) => ({
            ...previous,
            [menuId]: !previous[menuId],
        }));
    };

    const toggleModule = (value, group) => {
        setSelectedModules((previous) => {
            const selected = new Set(previous);

            if (selected.has(value)) {
                selected.delete(value);
            } else {
                selected.add(value);
            }

            /*
             * Selecting an individual module permission also grants
             * the parent module permission required by the current
             * frontend routes.
             */
            // const parentOption = group.options.find(
            //     (option) => option.value === group.parent
            // );

            // if (
            //     value !== group.parent &&
            //     selected.has(value) &&
            //     parentOption
            // ) {
            //     selected.add(group.parent);
            // }

            /*
             * If the parent module is deselected, remove its
             * individual permissions as well.
             */
            if (
                value === group.parent &&
                !selected.has(group.parent)
            ) {
                group.options.forEach((option) => {
                    selected.delete(option.value);
                });
            }

            return Array.from(selected);
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const payload = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            role: form.role,
            branch: form.branch || "ALL",
            accessModules: selectedModules.join(","),
        };

        if (!editingUser || form.password.trim()) {
            payload.password = form.password;
        }

        setSaving(true);

        try {
            if (editingUser) {
                await usersService.updateUser(
                    editingUser.id,
                    payload
                );

                // setSuccess("User updated successfully.");
                window.alert("User updated successfully.");

            } else {
                await usersService.createUser(payload);
                // setSuccess("User created successfully.");
                window.alert("User created successfully.");
            }

            setModalOpen(false);
            setEditingUser(null);
            setForm({ ...INITIAL_FORM });
            setSelectedModules([]);

            await loadUsers();
        } catch (err) {
            setError(
                err.message ||
                "Unable to save user."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${user.name}?`
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await usersService.deleteUser(user.id);

            // setSuccess("User deleted successfully.");
            window.alert("ser deleted successfully.");

            await loadUsers();
        } catch (err) {
            setError(
                err.message ||
                "Unable to delete user."
            );
        }
    };

    return (
        <section
            id="main-content"
            className="users-page"
        >
            <div className="users-page-header">
                <div className="users-title-area">
                    <div className="users-title">
                        <span className="users-title-icon">
                            👤
                        </span>

                        <span>View Users</span>
                    </div>

                    <div className="users-subtitle">
                        Manage system users

                        <span className="users-count">
                            {users.length} Users
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="users-create-btn"
                    onClick={openCreateUserModal}
                >
                    ＋ Create User
                </button>
            </div>

            {error && (
                <div className="alert alert-info">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-info">
                    {success}
                </div>
            )}

            <section className="wrapper">
                <div className="table-agile-info">
                    <div className="panel panel-default">
                        <div className="refollowup-search-wrap">
                            <span className="refollowup-search-icon">
                                🔍
                            </span>

                            <input
                                type="text"
                                id="txt_searchall"
                                className="refollowup-input"
                                placeholder="Search Users"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                        </div>

                        <div
                            className="refollowup-table-wrapper"
                            id="scrollable-content"
                        >
                            <table className="refollowup-table">
                                <thead>
                                    <tr>
                                        <th>Sr.No.</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Branch</th>
                                        <th>Access Module</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="users-no-result"
                                            >
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="users-no-result"
                                            >
                                                No results found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(
                                            (user, index) => (
                                                <tr key={user.id}>
                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        {user.name}
                                                    </td>

                                                    <td>
                                                        {user.phone || "-"}
                                                    </td>

                                                    <td>
                                                        {user.email}
                                                    </td>

                                                    <td>
                                                        {user.role}
                                                    </td>

                                                    <td>
                                                        {user.branch || "-"}
                                                    </td>

                                                    <td>
                                                        {user.accessModules || "-"}
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            onClick={() =>
                                                                openEditUserModal(user)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        {" "}

                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            onClick={() =>
                                                                handleDelete(user)
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Create / Edit User Modal */}
            <div
                id="createUserModal"
                className={`create-user-modal ${modalOpen ? "show" : ""
                    }`}
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        closeCreateUserModal();
                    }
                }}
            >
                <div
                    className="modal-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="createUserModalLabel"
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5
                                className="modal-title"
                                id="createUserModalLabel"
                            >
                                {editingUser
                                    ? "Edit User"
                                    : "Create New User"}
                            </h5>

                            <button
                                type="button"
                                className="close"
                                onClick={closeCreateUserModal}
                                aria-label="Close"
                                disabled={saving}
                            >
                                <span aria-hidden="true">
                                    &times;
                                </span>
                            </button>
                        </div>

                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phone"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">
                                        Password
                                    </label>
                                    <div className="password-input-wrap">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleInputChange}
                                            minLength="6"
                                            required={!editingUser}
                                            autoComplete="new-password"
                                            placeholder={
                                                editingUser
                                                    ? "Leave blank to keep current password; passwords cannot be viewed"
                                                    : ""
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword((visible) => !visible)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>

                                </div>

                                <div className="form-group">
                                    <label htmlFor="role">
                                        Role
                                    </label>

                                    <select
                                        className="form-control"
                                        id="role"
                                        name="role"
                                        value={form.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">
                                            Select User
                                        </option>

                                        <option value="SUPER_ADMIN">
                                            super_admin
                                        </option>

                                        <option value="BRANCH_ADMIN">
                                            branch_admin
                                        </option>

                                        <option value="HR">
                                            HR
                                        </option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="branch">
                                        Branch
                                    </label>

                                    <select
                                        className="form-control"
                                        id="branch"
                                        name="branch"
                                        value={form.branch}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">
                                            Select Branch
                                        </option>

                                        <option value="Nagpur">
                                            Nagpur
                                        </option>

                                        <option value="Bramhapuri">
                                            Bramhapuri
                                        </option>

                                        <option value="Chandrapur">
                                            Chandrapur
                                        </option>

                                        <option value="ALL">
                                            ALL
                                        </option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <b>Module Access:</b>
                                    </label>

                                    {MODULE_GROUPS.map((group) => (
                                        <div
                                            className="accordion-item"
                                            key={group.id}
                                        >
                                            <label
                                                onClick={() =>
                                                    toggleMenu(group.id)
                                                }
                                                style={{
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {openMenus[group.id]
                                                    ? "▼ "
                                                    : "▶ "}

                                                {group.title}
                                            </label>

                                            <div
                                                id={group.id}
                                                style={{
                                                    display: openMenus[group.id]
                                                        ? "block"
                                                        : "none",
                                                    border: "1px solid #ccc",
                                                    padding: "10px",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                {group.options.map(
                                                    (option) => (
                                                        <label
                                                            key={option.value}
                                                            style={{
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedModules.includes(
                                                                    option.value
                                                                )}
                                                                onChange={() =>
                                                                    toggleModule(
                                                                        option.value,
                                                                        group
                                                                    )
                                                                }
                                                            />

                                                            {option.label}
                                                        </label>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/*
                                      Dashboard and Chat are available to
                                      all authenticated users. They are not
                                      configurable module permissions here.
                                    */}
                                </div>

                                {error && (
                                    <div className="alert alert-info">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingUser
                                            ? "Update User"
                                            : "Create User"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default User;
