import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import favicon from "../../../assets/fevicon.png";
import "./Login.css";

function Login() {

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            await login(email, password);

            /*
             * AuthContext now contains the authenticated user.
             *
             * App.jsx will automatically switch from
             * Login → authenticated application.
             */

        } catch (err) {

            console.error("Login failed:", err);

            setError(err.message || "Invalid email or password");

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-page">

            {/* Logo + Company Name */}
            <div className="logo-area">

                <div className="logo-circle">

                    <img
                        src={favicon}
                        alt="SHUL Ventures"
                    />

                </div>

                <div className="company-name">
                    SHUL VENTURES
                </div>

            </div>


            {/* Login Card */}
            <div className="login-card">

                <div className="welcome">

                    <h2>
                        Welcome Back! 👋
                    </h2>

                    <p>
                        Sign in to your admin account
                    </p>

                </div>


                {/* React Error */}
                {error && (
                    <div className="errors">
                        {error}
                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    {/* Email */}
                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className="input-box">

                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter email address"
                                autoComplete="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />
                        </div>
                    </div>


                    {/* Password */}
                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="input-box">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                id="password"
                                name="password"
                                placeholder="Enter password"
                                className="password-input"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />

                            <span
                                className="password-icon"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                id="passwordIcon"
                                role="button"
                                tabIndex={0}
                            >
                                {showPassword ? "👁️" : "🙈"}
                            </span>
                        </div>
                    </div>


                    {/* Login Button */}
                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing In..."
                            : "🚀  Sign In"}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <div className="footer">
                © 2026 Shul Ventures Pvt. Ltd. · All rights reserved
            </div>
        </div>
    );
}
export default Login;