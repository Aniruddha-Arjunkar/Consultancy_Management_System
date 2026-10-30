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

const getCurrentRequirements = async () => {
    const response = await fetch(`${API_BASE_URL}/interviews/requirements`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const scheduleInterview = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/interviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const getScheduledInterviews = async () => {
    const response = await fetch(`${API_BASE_URL}/interviews`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};


const getInterviewForUpdate = async (interviewId) => {
    const response = await fetch(
        `${API_BASE_URL}/interviews/${encodeURIComponent(interviewId)}/edit-details`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const rescheduleInterview = async (interviewId, payload) => {
    const response = await fetch(
        `${API_BASE_URL}/interviews/${encodeURIComponent(interviewId)}/reschedule`,
        {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const completeInterview = async (interviewId) => {
    const response = await fetch(
        `${API_BASE_URL}/interviews/${encodeURIComponent(interviewId)}/complete`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const scheduleNextRound = async (interviewId, payload) => {
    const response = await fetch(
        `${API_BASE_URL}/interviews/${encodeURIComponent(interviewId)}/next-round`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const setInterviewDecision = async (interviewId, status) => {
    const response = await fetch(
        `${API_BASE_URL}/interviews/${encodeURIComponent(interviewId)}/decision`,
        {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

const savePlacementPayment = async (interviewId, payload) => {
    const response = await fetch(
        `${API_BASE_URL}/interviews/${encodeURIComponent(interviewId)}/placement-payment`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) throw new Error(await readError(response));
    return response.json();
};

export default {
    getCurrentRequirements,
    scheduleInterview,
    getScheduledInterviews,
    getInterviewForUpdate,
    rescheduleInterview,
    completeInterview,
    scheduleNextRound,
    setInterviewDecision,
    savePlacementPayment,
};
