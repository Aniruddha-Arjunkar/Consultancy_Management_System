import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const loadCurrentUser = async () => {
            try {
                const currentUser =
                    await authService.getCurrentUser();

                setUser(currentUser);

            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadCurrentUser();
    }, []);


    const login = async (email, password) => {

        const loggedInUser =
            await authService.login(
                email,
                password
            );

        setUser(loggedInUser);
        return loggedInUser;
    };


    const logout = async () => {

        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    };


    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(AuthContext);
}