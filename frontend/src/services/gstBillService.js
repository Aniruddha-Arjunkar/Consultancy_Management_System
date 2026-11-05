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

const getInvoices = async () => {
    const response = await fetch(`${API_BASE_URL}/gst-bills/invoices`, {
        method: "GET",
        credentials: "include",
    });
    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const getInvoice = async (invoiceId) => {
    const response = await fetch(
        `${API_BASE_URL}/gst-bills/invoices/${encodeURIComponent(invoiceId)}`,
        { method: "GET", credentials: "include" }
    );
    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const updateInvoice = async (invoiceId, update) => {
    const response = await fetch(
        `${API_BASE_URL}/gst-bills/invoices/${encodeURIComponent(invoiceId)}`,
        {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(update),
        }
    );
    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const downloadInvoicePdf = async (invoiceId, invoiceNumber) => {
    const response = await fetch(
        `${API_BASE_URL}/gst-bills/invoices/${encodeURIComponent(invoiceId)}/pdf`,
        { method: "GET", credentials: "include" }
    );
    if (!response.ok) throw new Error(await readError(response));

    const pdf = await response.blob();
    const url = URL.createObjectURL(pdf);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GST_Invoice_${invoiceNumber || invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default {
    getGenerateBills,
    getEligibleBill,
    createInvoice,
    getInvoices,
    getInvoice,
    updateInvoice,
    downloadInvoicePdf,
};
