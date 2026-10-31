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

const convertStudent = async (studentId, payload) => {
    const response = await fetch(
        `${API_BASE_URL}/students/${encodeURIComponent(studentId)}/agreement`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const getCandidates = async () => {
    const response = await fetch(`${API_BASE_URL}/agreements`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};


const getCandidate = async (candidateId) => {
    const response = await fetch(
        `${API_BASE_URL}/agreements/${encodeURIComponent(candidateId)}`,
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

const updateCandidate = async (candidateId, payload) => {
    const response = await fetch(
        `${API_BASE_URL}/agreements/${encodeURIComponent(candidateId)}`,
        {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};

const blacklistCandidate = async (candidateId) => {
    const response = await fetch(
        `${API_BASE_URL}/agreements/${encodeURIComponent(candidateId)}/blacklist`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
};


const deleteCandidate = async (candidateId) => {
    const response = await fetch(
        `${API_BASE_URL}/agreements/${encodeURIComponent(candidateId)}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(await readError(response));
    }
};

const getCandidateInterviews = async (candidateId) => {
    const response = await fetch(
        `${API_BASE_URL}/agreements/${encodeURIComponent(candidateId)}/interviews`,
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

const getCandidateResumeUrl = (candidateId) =>
    `${API_BASE_URL}/agreements/${encodeURIComponent(candidateId)}/resume`;
export default {
    convertStudent,
    getCandidates,
    getCandidate,
    updateCandidate,
    getCandidateResumeUrl,
    blacklistCandidate,
    deleteCandidate,
    getCandidateInterviews
};