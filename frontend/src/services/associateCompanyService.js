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

const createAssociateCompany = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/associate-companies`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};



const getAssociateCompanies = async () => {
    const response = await fetch(`${API_BASE_URL}/associate-companies`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};



const getAssociateCompanyById = async (associateId) => {
    const response = await fetch(
        `${API_BASE_URL}/associate-companies/${encodeURIComponent(associateId)}`,
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

const updateAssociateCompany = async (associateId, formData) => {
    const response = await fetch(
        `${API_BASE_URL}/associate-companies/${encodeURIComponent(associateId)}`,
        {
            method: "PUT",
            credentials: "include",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

export default {
    createAssociateCompany,
    getAssociateCompanies,
    getAssociateCompanyById,
    updateAssociateCompany
};