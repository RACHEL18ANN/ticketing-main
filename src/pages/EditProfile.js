import React, { useState, useRef, useEffect } from 'react';
import '../styles/EditProfile.css';
import { FaEye, FaEyeSlash, FaCloudUploadAlt } from 'react-icons/fa';
import { ShieldCheck, X, CheckCircle, AlertCircle } from 'lucide-react'; 

const EditProfile = ({ user = {}, onSave = () => {} }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    middleInitial: user?.middleInitial || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    profilePic: user?.profilePic || null,
    currentPassword: '', 
    newPassword: '',
    retypePassword: ''
  });

  // --- NEW TOAST STATE ---
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRetype, setShowRetype] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedPassword = localStorage.getItem('userPassword');
    setFormData(prev => ({
      ...prev,
      firstName: user?.firstName || '',
      middleInitial: user?.middleInitial || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      profilePic: user?.profilePic || null,
      currentPassword: savedPassword || user?.password || 'password123'
    }));
  }, [user]);

  // --- TOAST HELPER ---
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === "middleInitial" ? value.charAt(0).toUpperCase() : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePasswordClick = () => {
    if (!formData.newPassword || formData.newPassword !== formData.retypePassword) {
      showToast("Passwords do not match or are empty!", "error");
      return;
    }
    setShowVerification(true);
  };

  const confirmPasswordUpdate = () => {
    if (verificationCode.length === 6) {
      localStorage.setItem('userPassword', formData.newPassword);
      onSave({ ...formData, currentPassword: formData.newPassword });
      setShowVerification(false);
      setVerificationCode("");
      setFormData(prev => ({ ...prev, newPassword: '', retypePassword: '' }));
      showToast("Password updated successfully!", "success");
    } else {
      showToast("Please enter a valid 6-digit code.", "error");
    }
  };

  const handleGeneralSave = () => {
    onSave(formData);
    showToast("Profile changes saved!", "success");
  };

  return (
    <div className="profile-wrapper">
      {/* --- CUSTOM TOAST NOTIFICATION --- */}
      {toast.show && (
        <div className={`notification-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* --- VERIFICATION MODAL --- */}
      {showVerification && (
        <div className="modal-overlay">
          <div className="verification-modal">
            <button className="close-modal" onClick={() => setShowVerification(false)}>
              <X size={20} />
            </button>
            <div className="modal-icon-circle">
              <ShieldCheck size={32} color="#0038A8" />
            </div>
            <h3>Verify your identity</h3>
            <p>We sent a 6-digit code to <strong>{formData.email}</strong></p>
            <input 
              type="text" 
              placeholder="000000" 
              className="modal-code-input"
              maxLength="6"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button className="btn-confirm-update" onClick={confirmPasswordUpdate}>
              Confirm Update
            </button>
          </div>
        </div>
      )}

      <div className="profile-header">
        <h1>Profile</h1>
        <p>Update your profile settings</p>
      </div>

      {/* --- PROFILE PICTURE CARD --- */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Profile Picture</h2>
          <p>This image will be displayed on your sidebar.</p>
        </div>
        <div className="inner-card photo-flex">
          <div className="avatar-large">
            {formData.profilePic ? (
              <img src={formData.profilePic} alt="Profile" />
            ) : (
              <div className="guest-avatar-edit">
                <svg viewBox="0 0 24 24" fill="#718096"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
            accept="image/*" 
          />
          <div className="upload-box" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
            <FaCloudUploadAlt className="upload-icon-svg" />
            <p><strong>Click to upload</strong> or drag and drop</p>
          </div>
          <div className="card-actions">
            <button type="button" className="btn-link save" onClick={handleGeneralSave}>Save Changes</button>
          </div>
        </div>
      </div>

      {/* --- PERSONAL INFO CARD --- */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Personal Information</h2>
          <p>Update your personal details here.</p>
        </div>
        <div className="inner-card">
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: '0 0 80px' }}>
              <label>M.I.</label>
              <input type="text" name="middleInitial" value={formData.middleInitial} onChange={handleChange} maxLength="1" />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="card-actions">
            <button type="button" className="btn-link save" onClick={handleGeneralSave}>Save Changes</button>
          </div>
        </div>
      </div>

      {/* --- SECURITY CARD --- */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Security</h2>
          <p>Change your password</p>
        </div>
        <div className="inner-card">
          <div className="form-group">
            <label>Current Password</label>
            <div className="input-with-icon">
              <input type={showCurrent ? "text" : "password"} value={formData.currentPassword} readOnly />
              <span className="icon-trigger" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>New Password</label>
            <div className="input-with-icon">
              <input type={showNew ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleChange} />
              <span className="icon-trigger" onClick={() => setShowNew(!showNew)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="input-with-icon">
              <input type={showRetype ? "text" : "password"} name="retypePassword" value={formData.retypePassword} onChange={handleChange} />
              <span className="icon-trigger" onClick={() => setShowRetype(!showRetype)}>
                {showRetype ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="card-actions">
            <button type="button" className="btn-link save" onClick={handleUpdatePasswordClick}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;