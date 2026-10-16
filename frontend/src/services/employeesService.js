import API_BASE_URL from "./api";

const createEmployee = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        try {
            const data = await response.json();
            message = data.message || data.error || message;
        } catch {
            // The response did not contain JSON.
        }
        throw new Error(message);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

const getEmployees = async (status = "regular") => {
    const response = await fetch(
        `${API_BASE_URL}/employees?status=${encodeURIComponent(status)}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        try {
            const data = await response.json();
            message = data.message || data.error || message;
        } catch {
            // The response did not contain JSON.
        }
        throw new Error(message);
    }

    return response.json();
};


const getEmployeeById = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/employees/${encodeURIComponent(id)}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        try {
            const data = await response.json();
            message = data.message || data.error || message;
        } catch {
            // The response did not contain JSON.
        }
        throw new Error(message);
    }

    return response.json();
};

const uploadEmployeeDocument = async (employeeId, formData) => {
    const response = await fetch(
        `${API_BASE_URL}/employees/${encodeURIComponent(employeeId)}/documents`,
        {
            method: "POST",
            credentials: "include",
            body: formData,
        }
    );

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        try {
            const data = await response.json();
            message = data.message || data.error || message;
        } catch {
            // The response did not contain JSON.
        }

        throw new Error(message);
    }

    return response.json();
};

const getEmployeeDocuments = async (employeeId) => {
    const response = await fetch(
        `${API_BASE_URL}/employees/${encodeURIComponent(employeeId)}/documents`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        try {
            const data = await response.json();
            message = data.message || data.error || message;
        } catch {
            // The response did not contain JSON.
        }

        throw new Error(message);
    }

    return response.json();
};


const updateEmployee = async (employeeId, formData) => {
    const response = await fetch(
        `${API_BASE_URL}/employees/${encodeURIComponent(employeeId)}`,
        {
            method: "PUT",
            credentials: "include",
            body: formData,
        }
    );

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        try {
            const data = await response.json();
            message = data.message || data.error || message;
        } catch {
            // The response did not contain JSON.
        }
        throw new Error(message);
    }
    return response.json();
};

const processEmployeeResignation = async (employeeId, resignationData) => {
    const response = await fetch(
        `${API_BASE_URL}/employees/${encodeURIComponent(employeeId)}/resignation`,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(resignationData),
        }
    );

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        try {
            const data = await response.json();
            message = data.message || data.error || message;
        } catch {
            // The response did not contain JSON.
        }

        throw new Error(message);
    }

    return response.json();
};

const employeesService = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    uploadEmployeeDocument,
    getEmployeeDocuments,
    updateEmployee,
    processEmployeeResignation
};
export default employeesService;