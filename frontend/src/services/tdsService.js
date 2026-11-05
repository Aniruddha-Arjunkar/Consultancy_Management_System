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

const getDueTds = async () => {
    const response = await fetch(`${API_BASE_URL}/accounts/tds/due`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const markTdsPaid = async (paymentId) => {
    const response = await fetch(
        `${API_BASE_URL}/accounts/tds/${encodeURIComponent(paymentId)}/paid`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    if (!response.ok) throw new Error(await readError(response));
};

export default { getDueTds, markTdsPaid };