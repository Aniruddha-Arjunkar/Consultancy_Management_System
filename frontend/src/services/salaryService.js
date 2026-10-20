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

const getEligibleEmployees = async () => {
    const response = await fetch(`${API_BASE_URL}/salaries/employees`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const previewSalary = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/salaries/preview`, {
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

const createSalary = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/salaries`, {
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



const getEmployeeSalaryHistory = async (employeeId, month) => {
    const response = await fetch(
        `${API_BASE_URL}/salaries/employees/${encodeURIComponent(employeeId)}/history?month=${encodeURIComponent(month)}`,
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
const salaryService = {
    getEligibleEmployees,
    previewSalary,
    createSalary,
    getEmployeeSalaryHistory
};

export default salaryService;