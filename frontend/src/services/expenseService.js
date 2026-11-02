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

const createExpense = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
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


const getExpenses = async (fromDate = "", endDate = "") => {
    const params = new URLSearchParams();

    if (fromDate) params.set("fromDate", fromDate);
    if (endDate) params.set("endDate", endDate);

    const query = params.toString();
    const response = await fetch(
        `${API_BASE_URL}/expenses${query ? `?${query}` : ""}`,
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
export default { createExpense, getExpenses };