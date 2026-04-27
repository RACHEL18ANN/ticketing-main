import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from 'lucide-react';
import '../styles/Login.css';
import Logo from '../assets/images/logo.png';

const Login = ({ onLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const TEMP_OFFICER_EMAIL = "officer@test.com";
        
        // --- UPDATED LOGIC: CHECK FOR RESET PASSWORD FIRST ---
        // If 'userPassword' exists in localStorage, use it. Otherwise, use 'pass123'.
        const savedPass = localStorage.getItem('userPassword');
        const TEMP_OFFICER_PASS = savedPass || "pass123";

        setTimeout(() => {
            if (email.toLowerCase() === TEMP_OFFICER_EMAIL && password === TEMP_OFFICER_PASS && role === "Officer") {
                const tempOfficerUser = {
                    email: "email@email.com",
                    firstName: "Officer",
                    lastName: "User",
                    role: "Officer",
                    profilePic: ""
                };
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('currentUser', JSON.stringify(tempOfficerUser));
                if (onLogin) onLogin(tempOfficerUser);
                navigate('/dashboard'); 
                return;
            }

            const allUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            const matchedUser = allUsers.find(
                (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );

            if (matchedUser) {
                if (matchedUser.role !== role) {
                    alert(`Access Denied: Registered as ${matchedUser.role}.`);
                    setIsLoading(false);
                    return;
                }
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('currentUser', JSON.stringify(matchedUser));
                if (onLogin) onLogin(matchedUser);
                navigate('/dashboard');
            } else {
                alert("Invalid credentials.");
                setIsLoading(false);
            }
        }, 1000); 
    };

    return (
        <div className="auth-wrapper">
            <div className="shape-blue"></div>
            <div className="shape-red"></div>

            <div className="auth-content">
                <div className="brand-section">
                    <img src={Logo} alt="DOLE Logo" className="logo-img" />
                    <h1 className="dept-name">Department of Labor and Employment</h1>
                    <h2 className="welcome-heading">Welcome Back</h2>
                    <p className="sub-heading">Please enter your authorized credentials</p>
                </div>

                <div className="form-container">
                    <form className="glass-card" onSubmit={handleSignIn}>
                        <div className="auth-input-group">
                            <Mail className="input-icon-left" size={18} />
                            <input
                                type="email"
                                placeholder="Corporate Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="auth-input-group">
                            <Lock className="input-icon-left" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>

                        <div className="role-selector">
                            <ShieldCheck size={18} className="role-icon" />
                            <label>Sign In As:</label>
                            <select
                                className="custom-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                                disabled={isLoading}
                            >
                                <option value="">Select Role</option>
                                <option value="Admin">Admin</option>
                                <option value="Officer">Officer</option>
                            </select>
                        </div>

                        <button
                            className="forgot-lnk"
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            disabled={isLoading}
                        >
                            Forgot Password?
                        </button>

                        <div id="login-action-area">
                            <button
                                id="login-submit-btn"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Verifying..." : "Sign In"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;