import API_BASE_URL from "./api";

const USERS_URL = `${API_BASE_URL}/users`;

const request = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        let message = "Something went wrong.";

        try {
            const data = await response.json();

            message =
                data.message ||
                data.error ||
                message;
        } catch {
            // The response did not contain JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    const contentType =
        response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
};

const getAllUsers = () => {
    return request(USERS_URL);
};

const createUser = (userData) => {
    return request(USERS_URL, {
        method: "POST",
        body: JSON.stringify(userData),
    });
};

const updateUser = (id, userData) => {
    return request(`${USERS_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
    });
};

const deleteUser = (id) => {
    return request(`${USERS_URL}/${id}`, {
        method: "DELETE",
    });
};

const usersService = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
};
export default usersService;