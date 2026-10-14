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

const getEmployees = async () => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
        method: "GET",
        credentials: "include",
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

    return response.json();
};

const employeesService = {
    createEmployee,
    getEmployees,
};
export default employeesService;