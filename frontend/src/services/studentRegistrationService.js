import API_BASE_URL from "./api";

const readError = async (response) => {
    let message = `Request failed (${response.status}).`;

    try {
        const data = await response.json();
        message = data.message || data.detail || data.error || message;
    } catch {
        // The response did not contain JSON.
    }

    return message;
};

const getCurrentRequirements = async () => {
    const response = await fetch(`${API_BASE_URL}/students/requirements`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const createStudentRegistration = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/students`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const getStudents = async () => {
    const response = await fetch(`${API_BASE_URL}/students`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const getStudentById = async (studentId) => {
    const response = await fetch(
        `${API_BASE_URL}/students/${encodeURIComponent(studentId)}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};



const updateStudent = async (studentId, payload) => {
    const response = await fetch(
        `${API_BASE_URL}/students/${encodeURIComponent(studentId)}`,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

export default {
    getCurrentRequirements,
    createStudentRegistration,
    getStudents,
    getStudentById,
    updateStudent
};