import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./Views/Auth/Login/Login";
import DashboardLayout from "./Layout/DashboardLayout/DashboardLayout.jsx";


function AppContent() {

    const { user, loading} = useAuth();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Login />;
    }
    return <DashboardLayout />;
}


function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
export default App;