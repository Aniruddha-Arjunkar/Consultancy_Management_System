import API_BASE_URL from "./api";

const getGenerateBills = async () => {
    const response = await fetch(`${API_BASE_URL}/gst-bills/generate-bills`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        try {
            const data = await response.json();
            message = data.message || data.detail || data.error || message;
        } catch {
            // The response did not contain JSON.
        }
        throw new Error(message);
    }

    return response.json();
};

const getEligibleBill = async (interviewId) => {
    const response = await fetch(
        `${API_BASE_URL}/gst-bills/generate-bills/${encodeURIComponent(interviewId)}`,
        { method: "GET", credentials: "include" }
    );
    if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        try {
            const data = await response.json();
            message = data.message || data.detail || data.error || message;
        } catch {
            // The response did not contain JSON.
        }
        throw new Error(message);
    }
    return response.json();
};

const createInvoice = async (interviewId, invoice) => {
    const response = await fetch(
        `${API_BASE_URL}/gst-bills/generate-bills/${encodeURIComponent(interviewId)}/invoice`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoice),
        }
    );
    if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        try {
            const data = await response.json();
            message = data.message || data.detail || data.error || message;
        } catch {
            // The response did not contain JSON.
        }
        throw new Error(message);
    }
    return response.json();
};

export default { getGenerateBills, getEligibleBill, createInvoice };
