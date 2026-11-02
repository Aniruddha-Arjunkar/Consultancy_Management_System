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

const getDuePayments = async () => {
    const response = await fetch(
        `${API_BASE_URL}/accounts/payments/due`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};


const getPayment = async (paymentId) => {
    const response = await fetch(
        `${API_BASE_URL}/accounts/payments/${encodeURIComponent(paymentId)}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const updatePayment = async (paymentId, payload) => {
    const response = await fetch(
        `${API_BASE_URL}/accounts/payments/${encodeURIComponent(paymentId)}`,
        {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const markClientDefaulter = async (clientId, defaulterNote) => {
    const response = await fetch(
        `${API_BASE_URL}/accounts/payments/clients/${encodeURIComponent(clientId)}/defaulter`,
        {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ defaulterNote }),
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response;
};

const getPaymentHistory = async () => {
    const response = await fetch(
        `${API_BASE_URL}/accounts/payments/history`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const getDefaulterPayments = async () => {
    const response = await fetch(
        `${API_BASE_URL}/accounts/payments/defaulters`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const reactivateClient = async (clientId) => {
    const response = await fetch(
        `${API_BASE_URL}/accounts/payments/clients/${encodeURIComponent(clientId)}/reactivate`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    if (!response.ok) throw new Error(await readError(response));
};

export default {
    getDuePayments,
    updatePayment,
    markClientDefaulter,
    getPayment,
    getPaymentHistory,
    getDefaulterPayments,
    reactivateClient
};