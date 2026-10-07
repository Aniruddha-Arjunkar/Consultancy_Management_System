const login = async (email, password) => {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        let message = "Login failed";

        try {
            const data = await response.json();
            message = data.message || message;
        } catch {
            // Ignore JSON parsing failure
        }

        throw new Error(message);
    }

    return response.json();
};


const getCurrentUser = async () => {

    const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Not authenticated");
    }

    return response.json();
};


const logout = async () => {

    const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }
};

const authService = {
    login,
    getCurrentUser,
    logout,
};
export default authService;
