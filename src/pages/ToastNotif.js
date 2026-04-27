import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import '../styles/ToastNotif.css';

const ToastNotif = ({ toast, setToast }) => {
  useEffect(() => {
    if (toast?.show) {
      // 5 second auto-hide
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast || !toast.show) return null;

  return (
    <div className={`global-toast-container ${toast.type}`}>
      <div className="toast-banner">
        {toast.type === "success" ? (
          <FaCheckCircle className="toast-icon" />
        ) : (
          <FaExclamationCircle className="toast-icon" />
        )}
        
        <span className="toast-msg-text">{toast.message}</span>
        
        <button 
          className="toast-close-x" 
          onClick={() => setToast({ ...toast, show: false })}
        >
          <FaTimes />
        </button>

        {/* ADD THIS LINE BELOW - This is the moving countdown bar */}
        <div className="toast-progress-bar"></div>
      </div>
    </div>
  );
};

export default ToastNotif;