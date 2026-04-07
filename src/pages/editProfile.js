import React, { useState, useRef, useEffect } from 'react';
import '../styles/editProfile.css';
import { FaEye, FaEyeSlash, FaCloudUploadAlt } from 'react-icons/fa';

const EditProfile = ({ user = {}, onSave = () => {} }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    middleInitial: user?.middleInitial || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    profilePic: user?.profilePic || null,
    currentPassword: 'password123',
    newPassword: '',
    retypePassword: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRetype, setShowRetype] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      firstName: user?.firstName || '',
      middleInitial: user?.middleInitial || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      profilePic: user?.profilePic || null,
    }));
  }, [user]);

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

  const handleSaveClick = () => {
    // Basic validation check without browser alerts
    if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.retypePassword) {
      return;
    }

    let updatedData = { 
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim()
    };

    if (formData.newPassword) {
      updatedData.currentPassword = formData.newPassword;
      updatedData.newPassword = '';
      updatedData.retypePassword = '';
    }

    onSave(updatedData);
    // Smooth scroll to top to see the updated name/photo immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Update your profile settings</p>
      </div>

      {/* PHOTO SECTION */}
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
                <svg viewBox="0 0 24 24" fill="#718096">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
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
            <button type="button" className="btn-link save" onClick={handleSaveClick}>Save Changes</button>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Personal Information</h2>
          <p>Update your personal details here.</p>
        </div>
        <div className="inner-card">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                placeholder="e.g. Bea"
              />
            </div>
            <div className="form-group" style={{ flex: '0 0 80px' }}>
              <label htmlFor="middleInitial">M.I.</label>
              <input 
                type="text" 
                id="middleInitial" 
                name="middleInitial" 
                value={formData.middleInitial} 
                onChange={handleChange} 
                maxLength="1" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="userEmail">Email Address *</label>
            <input 
              type="email" 
              id="userEmail" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>
          <div className="card-actions">
            <button type="button" className="btn-link save" onClick={handleSaveClick}>Save Changes</button>
          </div>
        </div>
      </div>

      {/* PASSWORD SECTION */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Security</h2>
          <p>Change your password</p>
        </div>
        <div className="inner-card">
          <div className="form-group">
            <label htmlFor="currentPass">Current Password</label>
            <div className="input-with-icon">
              <input 
                type={showCurrent ? "text" : "password"} 
                id="currentPass" 
                name="currentPassword" 
                value={formData.currentPassword} 
                onChange={handleChange} 
              />
              <span className="icon-trigger" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="newPass">New Password</label>
            <div className="input-with-icon">
              <input 
                type={showNew ? "text" : "password"} 
                id="newPass" 
                name="newPassword" 
                value={formData.newPassword} 
                onChange={handleChange} 
              />
              <span className="icon-trigger" onClick={() => setShowNew(!showNew)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="retypePass">Confirm New Password</label>
            <div className="input-with-icon">
              <input 
                type={showRetype ? "text" : "password"} 
                id="retypePass" 
                name="retypePassword" 
                value={formData.retypePassword} 
                onChange={handleChange} 
              />
              <span className="icon-trigger" onClick={() => setShowRetype(!showRetype)}>
                {showRetype ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="card-actions">
            <button type="button" className="btn-link save" onClick={handleSaveClick}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;