import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./Views/Auth/Login/Login";


function AppContent() {

    const {
        user,
        loading
    } = useAuth();


    if (loading) {
        return null;
    }


    if (!user) {
        return <Login />;
    }


    /*
     * Temporary authenticated screen.
     *
     * We will replace this with the real application
     * layout/dashboard after authentication is completely
     * integrated.
     */

    return (
        <div>
            <h1>Authentication Successful</h1>

            <p>
                Welcome, {user.name}
            </p>

            <p>
                Role: {user.role}
            </p>

            <p>
                Branch: {user.branch}
            </p>

            <p>
                Modules: {user.accessModules}
            </p>
        </div>
    );
}
function App() {

    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
export default App;