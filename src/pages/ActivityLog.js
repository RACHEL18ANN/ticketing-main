import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ActivityLog.css';
import { 
  FaArrowLeft, FaTrashAlt, FaEdit, 
  FaArchive, FaTimes, FaHistory, FaListUl, 
  FaEllipsisV, FaBan, FaPaperPlane,
  FaFileMedical // Icon for the Minutes button
} from 'react-icons/fa';

const ActivityLog = ({ onBack, onEdit }) => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [actionTarget, setActionTarget] = useState(null);
  const [viewMode, setViewMode] = useState('active'); 
  const [showCancelReasons, setShowCancelReasons] = useState(false);
  const [isTypingOther, setIsTypingOther] = useState(false);
  const [customReason, setCustomReason] = useState("");

  const cancellationReasons = [
    "Health Reasons", 
    "Emergency", 
    "Incomplete Documents", 
    "Weather/Force Majeure"
  ];

  const loadLogs = useCallback(() => {
    const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
    const sortedLogs = [...savedHearings].sort((a, b) => b.id - a.id);
    
    if (viewMode === 'active') {
      setLogs(sortedLogs.filter(h => h.status?.toLowerCase() !== 'done' && h.status?.toLowerCase() !== 'cancelled'));
    } else {
      setLogs(sortedLogs.filter(h => h.status?.toLowerCase() === 'done' || h.status?.toLowerCase() === 'cancelled'));
    }
  }, [viewMode]);

  useEffect(() => {
    loadLogs();
    window.addEventListener('storage', loadLogs);
    return () => window.removeEventListener('storage', loadLogs);
  }, [loadLogs]);

  const handleFinalAction = (type, reason = null) => {
    const saved = JSON.parse(localStorage.getItem('hearings')) || [];
    let updated;

    if (type === 'delete') {
      updated = saved.filter(h => h.id !== actionTarget);
    } else if (type === 'archive') {
      updated = saved.map(h => h.id === actionTarget ? { ...h, status: 'Done' } : h);
    } else if (type === 'cancel') {
      updated = saved.map(h => 
        h.id === actionTarget ? { ...h, status: 'Cancelled', remarks: `Cancelled: ${reason}` } : h
      );
    }

    localStorage.setItem('hearings', JSON.stringify(updated));
    loadLogs();
    closeModal();
  };

  const closeModal = () => {
    setActionTarget(null);
    setShowCancelReasons(false);
    setIsTypingOther(false);
    setCustomReason("");
  };

  return (
    <div className="activity-log-page">
      <div className="log-header-section">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Activity Log
        </button>

        <div className="view-toggle-container">
          <button 
            className={`toggle-btn ${viewMode === 'active' ? 'active' : ''}`} 
            onClick={() => setViewMode('active')}
          >
            <FaListUl /> Active
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'archived' ? 'active' : ''}`} 
            onClick={() => setViewMode('archived')}
          >
            <FaHistory /> Archives
          </button>
        </div>
      </div>

      <div className="log-container-card">
        <div className="table-wrapper-inner">
          <table className="activity-table">
            <thead>
              <tr>
                <th className="col-no">No.</th>
                <th className="col-officer">Officer</th>
                <th className="col-date">Date</th>
                <th className="col-time">Time</th>
                <th className="col-purpose">Purpose/Reason</th>
                <th className="col-status">Status</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((row, index) => (
                  <tr key={row.id}>
                    <td className="col-no">{index + 1}</td>
                    <td className="col-officer officer-name-cell">{row.officer}</td>
                    <td className="col-date">{row.date?.toUpperCase()}</td>
                    <td className="col-time">{row.time}</td>
                    <td className="col-purpose purpose-cell">{row.title}</td>
                    <td className="col-status">
                      <span className={`status-label-text ${row.status?.toLowerCase()}`}>
                        {row.status || 'Pending'}
                      </span>
                    </td>
                    <td className="col-action">
                      <div className="action-btns-wrapper">
                        {/* Only show Minutes button if the status is Done/Archived */}
                        {row.status?.toLowerCase() === 'done' && (
                          <button 
                            className="minutes-btn" 
                            title="Add Minutes"
                            onClick={() => navigate('/minutes', { state: { rfaNumber: row.title } })}
                          >
                            <FaFileMedical />
                          </button>
                        )}
                        
                        <button className="edit-btn-icon" onClick={() => onEdit(row)}>
                            <FaEdit />
                        </button>
                        <button 
                            className="remark-btn" 
                            onClick={() => navigate(`/remark/${row.id}`)}
                        >
                            Remark
                        </button>
                        <button className="more-actions-btn" onClick={() => setActionTarget(row.id)}>
                          <FaEllipsisV />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row-container">
                  <td colSpan="7">No hearings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SECTION */}
      {actionTarget && (
        <div className="action-overlay">
          <div className="action-choice-card">
            <button className="close-action-btn" onClick={closeModal}><FaTimes /></button>
            
            {!showCancelReasons ? (
              <>
                <div className="modal-header-text">
                  <h4>Manage Activity</h4>
                  <p>What would you like to do with this record?</p>
                </div>
                <div className="choice-buttons">
                  <button className="choice-btn archive" onClick={() => handleFinalAction('archive')}>
                    <FaArchive className="choice-icon" />
                    <div className="choice-text">
                      <strong>Archive</strong>
                      <small>Mark as Done & Move to Archives</small>
                    </div>
                  </button>

                  <button className="choice-btn cancel" onClick={() => setShowCancelReasons(true)}>
                    <FaBan className="choice-icon" />
                    <div className="choice-text">
                      <strong>Cancel Schedule</strong>
                      <small>Cancel the meeting for today</small>
                    </div>
                  </button>

                  <button className="choice-btn delete" onClick={() => handleFinalAction('delete')}>
                    <FaTrashAlt className="choice-icon" />
                    <div className="choice-text">
                      <strong>Delete</strong>
                      <small>Remove permanently from system</small>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <h4>Reason for Cancellation</h4>
                <p>Please select a reason for cancelling this schedule.</p>
                
                {!isTypingOther ? (
                  <div className="reasons-grid">
                    {cancellationReasons.map((reason) => (
                      <button key={reason} className="reason-select-btn" onClick={() => handleFinalAction('cancel', reason)}>
                        {reason}
                      </button>
                    ))}
                    <button className="reason-select-btn other-btn" onClick={() => setIsTypingOther(true)}>
                      Other...
                    </button>
                  </div>
                ) : (
                  <div className="custom-reason-container">
                    <textarea 
                      className="custom-reason-input"
                      placeholder="Enter specific reason for cancellation..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      autoFocus
                    />
                    <button 
                      className="submit-custom-btn" 
                      onClick={() => handleFinalAction('cancel', customReason)}
                      disabled={!customReason.trim()}
                    >
                      <FaPaperPlane /> Submit Cancellation
                    </button>
                  </div>
                )}
                
                <button className="back-to-options" onClick={() => {
                  if(isTypingOther) setIsTypingOther(false);
                  else setShowCancelReasons(false);
                }}>
                  Go Back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;