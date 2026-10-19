import API_BASE_URL from "./api";

const readError = async (response) => {
    let message = `Request failed (${response.status}).`;

    try {
        const data = await response.json();
        message = data.message || data.detail || data.error || message;
    } catch {
        // Response did not contain JSON.
    }

    return message;
};

const getAttendanceEmployees = async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/employees`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const saveAttendance = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const attendanceService = {
    getAttendanceEmployees,
    saveAttendance,
};
export default attendanceService;
