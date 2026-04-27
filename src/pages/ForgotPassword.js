import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import '../styles/Login.css';
import Logo from '../assets/images/logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    return (
        <div className="auth-wrapper">
            <div className="shape-blue"></div>
            <div className="shape-red"></div>
            <div className="auth-content">
                <div className="brand-section">
                    <img src={Logo} alt="Logo" className="logo-img" />
                    <h2 className="welcome-heading">Forgot Password</h2>
                </div>
                <div className="form-container">
                    <form className="recovery-card" onSubmit={(e) => e.preventDefault()}>
                        <div className="auth-input-group">
                            <Mail className="input-icon-left" size={18} />
                            <input 
                                type="email" 
                                placeholder="Corporate Email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="recovery-button-group">
                            <button type="button" className="recovery-btn-secondary" onClick={() => navigate('/login')}>
                                Discard
                            </button>
                            <button type="submit" className="recovery-btn-main" onClick={() => navigate('/reset-password')}>
                                Send Code
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;