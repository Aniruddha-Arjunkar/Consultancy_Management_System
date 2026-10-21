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


const getAssociateCompanyOptions = async () => {
    const response = await fetch(
        `${API_BASE_URL}/requirements/associate-companies`,
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

const createCurrentRequirement = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/requirements`, {
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



const getCurrentRequirements = async () => {
    const response = await fetch(`${API_BASE_URL}/requirements`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};



const getCurrentRequirementById = async (requirementId) => {
    const response = await fetch(
        `${API_BASE_URL}/requirements/${encodeURIComponent(requirementId)}`,
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


const updateCurrentRequirement = async (requirementId, payload) => {
    const response = await fetch(
        `${API_BASE_URL}/requirements/${encodeURIComponent(requirementId)}`,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};


const closeCurrentRequirement = async (requirementId) => {
    const response = await fetch(
        `${API_BASE_URL}/requirements/${encodeURIComponent(requirementId)}/close`,
        {
            method: "POST",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(await readError(response));
    }
};


export default {
    getAssociateCompanyOptions,
    createCurrentRequirement,
    getCurrentRequirements,
    getCurrentRequirementById,
    updateCurrentRequirement,
    closeCurrentRequirement
};
