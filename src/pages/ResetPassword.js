import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import '../styles/Login.css';

const ResetPassword = () => {
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

    const navigate = useNavigate();

    const handleVerifyCode = () => {
        if (code.length === 6) {
            setIsVerified(true);
            setStatusMsg({ text: "Code verified successfully!", type: "success" });
            setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
        } else {
            setStatusMsg({ text: "Invalid code. Please enter 6 digits.", type: "error" });
        }
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        
        // --- SAVE TO LOCAL STORAGE ---
        localStorage.setItem('userPassword', password);
        
        setStatusMsg({ text: "Password updated! Redirecting...", type: "success" });
        
        setTimeout(() => {
            navigate('/login');
        }, 2000);
    };

    const isReadyToSave = isVerified && password.length > 0 && password === confirmPassword;

    return (
        <div className="auth-wrapper">
            <div className="shape-blue"></div>
            <div className="shape-red"></div>
            <div className="auth-content">
                <div className="floating-container">
                    {/* Header with Back Arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <ArrowLeft 
                            size={24} 
                            style={{ cursor: 'pointer', marginRight: '12px', color: '#333' }} 
                            onClick={() => navigate('/login')}
                        />
                        <h2 className="welcome-heading" style={{ margin: 0 }}>Reset Password</h2>
                    </div>
                    
                    <p className="sub-heading">Verification is required to proceed.</p>

                    {statusMsg.text && (
                        <div className={`status-box ${statusMsg.type}`}>
                            {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <span>{statusMsg.text}</span>
                        </div>
                    )}

                    <label className="input-label">Verification Code</label>
                    <div className="auth-input-group">
                        <ShieldCheck className="input-icon-left" size={18} />
                        <input 
                            type="text" 
                            placeholder="Enter 6-digit code" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={isVerified}
                        />
                        {isVerified && <CheckCircle className="eye-icon" color="green" size={18} />}
                    </div>

                    {/* Verify Button: Now always visible, but disabled after verification */}
                    <div className="recovery-button-group" style={{ marginBottom: '20px' }}>
                        <button 
                            type="button" 
                            className="btn-primary" 
                            onClick={handleVerifyCode}
                            disabled={isVerified}
                            style={{ opacity: isVerified ? 0.6 : 1, cursor: isVerified ? 'default' : 'pointer' }}
                        >
                            {isVerified ? "Verified" : "Verify Code"}
                        </button>
                    </div>

                    <div style={{ 
                        opacity: isVerified ? 1 : 0.5, 
                        transition: 'opacity 0.3s', 
                        pointerEvents: isVerified ? 'all' : 'none' 
                    }}>
                        <label className="input-label">New Password</label>
                        <div className="auth-input-group">
                            <Lock className="input-icon-left" size={18} />
                            <input 
                                type={showPass ? "text" : "password"} 
                                placeholder="Enter new password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={!isVerified}
                            />
                            <span className="eye-icon" onClick={() => setShowPass(!showPass)} style={{ cursor: 'pointer' }}>
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>

                        <label className="input-label">Confirm New Password</label>
                        <div className="auth-input-group">
                            <Lock className="input-icon-left" size={18} />
                            <input 
                                type={showPass ? "text" : "password"} 
                                placeholder="Confirm new password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={!isVerified}
                            />
                        </div>
                    </div>

                    {isVerified && (
                        <div className="recovery-button-group">
                            <button type="button" className="btn-secondary" onClick={() => navigate('/login')}>
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn-primary" 
                                disabled={!isReadyToSave}
                                style={{ opacity: isReadyToSave ? 1 : 0.5 }}
                                onClick={handleSavePassword}
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;