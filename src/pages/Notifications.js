import React from 'react';
import { FaArrowLeft, FaTimes, FaTrashAlt, FaClock, FaCalendarAlt } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import '../styles/Notifications.css';

const Notifications = ({ isOpen, onClose, notifications, onMarkAsRead, onClearAll, isFullPage }) => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSeeAll = (e) => {
    e.preventDefault();
    if (onClose) onClose();
    navigate('/notifications'); 
  };

  const containerClass = isFullPage 
    ? "notifications-fullscreen-v2" 
    : `side-notif-panel ${isOpen ? 'open' : ''}`;

  return (
    <>
      {!isFullPage && isOpen && <div className="side-panel-overlay" onClick={onClose}></div>}

      <div className={containerClass}>
        {/* ANGLED HEADER */}
        <div className={isFullPage ? "notifications-header-v2" : "side-panel-header"}>
          <div className="header-left">
            {isFullPage && (
              <button className="back-btn-v2" onClick={() => navigate(-1)}>
                <FaArrowLeft size={20} />
              </button>
            )}
            <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
          </div>

          <div className="header-actions">
            {notifications.length > 0 && (
              <button className="clear-all-btn" onClick={onClearAll}>
                <FaTrashAlt /> <span>Clear All</span>
              </button>
            )}
            {!isFullPage && (
              <button className="close-panel-btn" onClick={onClose}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* NOTIFICATION CONTENT */}
        <div className={isFullPage ? "notifications-list-v2" : "side-panel-scroll"}>
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={isFullPage ? `notification-row ${n.isRead ? 'read' : 'unread'}` : `side-notif-row ${n.isRead ? 'read' : 'unread'}`}
                onClick={() => !n.isRead && onMarkAsRead(n.id)}
              >
                {/* THE YELLOW BAR FROM PROTOTYPE */}
                <div className="left-accent yellow"></div>
                
                <div className="notif-content-wrapper">
                  <div className="notif-main-info">
                    <p className="notif-status-text">
                      Status: {n.title} Completed
                      {!n.isRead && <span className="unread-dot">●</span>}
                    </p>
                    <p className="notif-remarks">
                      Remarks: {n.remarks || "Task completed successfully. Check the Activity Log for more details."}
                    </p>
                    <p className="notif-officer">
                      Officer: <span>{n.officer || "System"}</span>
                    </p>
                  </div>

                  <div className="notif-meta-right">
                    <div className="meta-item">
                       <FaClock className="meta-icon" /> 
                       <span>Time: {n.time}</span>
                    </div>
                    <div className="meta-item">
                       <FaCalendarAlt className="meta-icon" /> 
                       <span>Date: {n.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="none-state">
              NO NEW NOTIFICATIONS
            </div>
          )}
        </div>

        {!isFullPage && (
          <div className="side-panel-footer" onClick={handleSeeAll}>
            See All Notifications
          </div>
        )}
        
        {isFullPage && <div className="bottom-red-accent"></div>}
      </div>
    </>
  );
};

export default Notifications; 