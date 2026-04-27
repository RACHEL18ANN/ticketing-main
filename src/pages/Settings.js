import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa"; // Added Icons
import "../styles/Settings.css";

const Settings = ({ user, onSave, onLogout, onDeleteAccount }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false); // Toggle state

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message, type) => {
    setToast({ show: true, message: message, type: type });
  };

  const handleSave = () => {
    onSave({ ...user, password }); // Save the new password
    triggerToast("Settings saved successfully!", "success");
    // Navigate to dashboard after a short delay to show the toast
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  const handleDiscard = () => {
    navigate("/dashboard");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your account? This action is permanent.")) {
      onDeleteAccount(); // Assuming this prop exists in App.js to clear data
      navigate("/login");
    }
  };

  const handleLogoutClick = () => {
    onLogout(); 
    navigate("/login"); 
  };

  return (
    <div className="settings-page">
      {toast.show && (
        <div className={`notification-toast ${toast.type}`}>
          <span className="toast-icon">{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}

      <div className="settings-bg-split"></div>
      
      <div className="settings-content-wrapper">
        <div className="settings-header" onClick={() => navigate("/dashboard")} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <FaArrowLeft style={{color: 'white'}}/>
          <h1 className="settings-title"> Settings</h1>
        </div>

        <div className="settings-main-layout">
          <div className="settings-column">
            {/* Notifications Card */}
            <div className="settings-card shadow-glow">
              <h3>Notifications</h3>
              <p className="sub-text">Enable all notifications</p>
              <div className="notif-control">
                <div className="status-indicator">
                  <span className={notifications ? "text-on" : "text-off"}>• On</span>
                  <span className={!notifications ? "text-on" : "text-off"}>Off</span>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>

            {/* Account Management Card */}
            <div className="settings-card shadow-glow">
              <h3>Account Management</h3>
              <div className="settings-input-container password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="settings-input"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button className="btn-delete-account" onClick={handleDelete}>Delete Account</button>
            </div>
          </div>

          {/* Profile Card */}
          <div className="settings-column">
            <div className="settings-card profile-card-center shadow-glow">
              <h3>Profile Picture</h3>
              <div className="profile-avatar-border">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="User" className="profile-avatar-img" />
                ) : (
                  <div className="profile-placeholder">User Profile</div>
                )}
              </div>
              <h2 className="profile-display-name">
                {user?.firstName} {user?.middleInitial ? `${user.middleInitial}. ` : ""}{user?.lastName}
              </h2>
              <button className="btn-logout-settings" onClick={handleLogoutClick}>Logout</button>
            </div>
          </div>
        </div>

        <div className="settings-action-footer">
          <button className="btn-save-changes" onClick={handleSave}>SAVE CHANGES</button>
          <button className="btn-discard-settings" onClick={handleDiscard}>DISCARD</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;