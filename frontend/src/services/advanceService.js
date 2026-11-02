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
    const response = await fetch(`${API_BASE_URL}/advances/employees`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const createAdvance = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/advances`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const getPendingAdvances = async () => {
    const response = await fetch(`${API_BASE_URL}/advances/pending`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const getAdvanceDetails = async (employeeId, month) => {
    const params = new URLSearchParams();

    if (month) params.set("month", month);

    const response = await fetch(
        `${API_BASE_URL}/advances/${encodeURIComponent(employeeId)}/details?${params}`,
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

export default {
    getEligibleEmployees,
    createAdvance,
    getPendingAdvances,
    getAdvanceDetails
};