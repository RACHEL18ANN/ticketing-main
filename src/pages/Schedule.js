import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Schedule.css';
import {
  FaChevronLeft,
  FaChevronRight,
  FaHistory,
  FaArrowLeft,
  FaTrash,
  FaPlus,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Schedule = ({ user, hideHeader, onSuccess, triggerToast, onShowLog }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [activePartyType, setActivePartyType] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  const [editingId, setEditingId] = useState(null);
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("10:00");
  const [requestingParties, setRequestingParties] = useState(['']);
  const [respondingParties, setRespondingParties] = useState(['']);

  const [formData, setFormData] = useState({
    purpose: '',
    selectedMonth: months[new Date().getMonth()],
    selectedDay: String(new Date().getDate()),
    laborViolation: 'Select',
    otherIssues: '',
    officer: ''
  });

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return "09:30";
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  // SYNC OFFICER NAME: Checks prop first, then 'currentUser' in localStorage
  useEffect(() => {
    const fetchOfficer = () => {
      const source = user || JSON.parse(localStorage.getItem('currentUser'));
      
      if (source) {
        console.log("Officer data found:", source);
        const first = toTitleCase(source.firstName || "");
        const mi = source.middleInitial ? `${source.middleInitial.toUpperCase().replace('.', '')}. ` : "";
        const last = toTitleCase(source.lastName || "");
        const fullName = `${first} ${mi}${last}`.trim();
        
        setFormData(prev => ({ ...prev, officer: fullName }));
      } else {
        console.warn("No user data found in props or localStorage under 'currentUser'");
      }
    };

    fetchOfficer();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.state?.editId) {
      const saved = JSON.parse(localStorage.getItem('hearings')) || [];
      const record = saved.find(h => h.id === location.state.editId);
      if (record) {
        setEditingId(record.id);
        setFormData(prev => ({
          ...prev, 
          purpose: record.title,
          selectedMonth: record.monthName || months[new Date().getMonth()],
          selectedDay: record.day,
          laborViolation: record.laborViolation || 'Select',
          otherIssues: record.otherIssues || ''
        }));
        setRequestingParties(record.requestingParty.split(', '));
        setRespondingParties(record.respondingParty.split(', '));
        if (record.time?.includes(' to ')) {
          const [start, end] = record.time.split(' to ');
          setStartTime(convertTo24Hour(start));
          setEndTime(convertTo24Hour(end));
        }
      }
    }
  }, [location.state]);

  const handleAddParty = (type) => {
    if (type === 'req') setRequestingParties([...requestingParties, '']);
    else setRespondingParties([...respondingParties, '']);
  };

  const handleRemoveParty = (type, index) => {
    if (type === 'req' && requestingParties.length > 1) setRequestingParties(requestingParties.filter((_, i) => i !== index));
    else if (type === 'res' && respondingParties.length > 1) setRespondingParties(respondingParties.filter((_, i) => i !== index));
  };

  const handlePartyNameChange = (type, index, value) => {
    const list = type === 'req' ? [...requestingParties] : [...respondingParties];
    list[index] = value;
    type === 'req' ? setRequestingParties(list) : setRespondingParties(list);
  };

  const handleCloseIconClick = () => {
    const listToCheck = activePartyType === 'req' ? requestingParties : respondingParties;
    const hasContent = listToCheck.some(n => n.trim() !== "");
    if (!hasContent) toast.error("Please ensure the party is named.");
    else setShowPartyModal(false);
  };

  const handleModalSave = () => {
    const listToCheck = activePartyType === 'req' ? requestingParties : respondingParties;
    const hasContent = listToCheck.some(n => n.trim() !== "");
    if (!hasContent) { toast.warn("Party name cannot be empty."); return; }
    setShowPartyModal(false);
  };

  const formatTimeToAmPm = (timeStr) => {
    if (!timeStr) return "";
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${suffix}`;
  };

  const handleSubmit = () => {
    const validReq = requestingParties.filter(n => n.trim() !== "");
    const validRes = respondingParties.filter(n => n.trim() !== "");
    if (!formData.purpose || validReq.length === 0 || validRes.length === 0) {
      toast.warn("Please complete the purpose and ensure both parties are named.");
      return;
    }
    const combinedTime = `${formatTimeToAmPm(startTime)} to ${formatTimeToAmPm(endTime)}`;
    const selectedDateObj = new Date(currentDate.getFullYear(), months.indexOf(formData.selectedMonth), parseInt(formData.selectedDay));

    const hearingData = {
      id: editingId || Date.now(),
      title: formData.purpose,
      time: combinedTime,
      day: formData.selectedDay,
      officer: formData.officer,
      requestingParty: validReq.join(', '),
      respondingParty: validRes.join(', '),
      laborViolation: formData.laborViolation,
      otherIssues: formData.otherIssues,
      status: "Scheduled",
      date: `${formData.selectedMonth.substring(0, 3).toUpperCase()} ${formData.selectedDay}`,
      monthName: formData.selectedMonth,
      year: currentDate.getFullYear(),
      dow: selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })
    };
    
    const saved = JSON.parse(localStorage.getItem('hearings')) || [];
    const updated = [...saved.filter(h => h.id !== editingId), hearingData];
    localStorage.setItem('hearings', JSON.stringify(updated));
    
    const msg = editingId ? "Schedule Updated!" : "Schedule Created!";
    if (triggerToast) triggerToast("success", msg); else toast.success(msg);
    if (onSuccess) onSuccess();
    else {
      setFormData(prev => ({ ...prev, purpose: '', laborViolation: 'Select', otherIssues: '' }));
      setRequestingParties(['']); setRespondingParties(['']); setEditingId(null);
    }
  };

  const month = currentDate.getMonth();
  const monthName = months[month];
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  return (
    <div className="schedule-page-wrapper">
      {!hideHeader && (
        <div className="page-header-container">
          <button onClick={() => navigate(-1)} className="back-nav-btn" type="button"><FaArrowLeft /></button>
          <h1 className="header-title">Schedule a Meeting</h1>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />

      {showPartyModal && (
        <div className="modal-overlay">
          <div className="party-modal">
            <div className="modal-header">
              <h3>{showConfirmExit ? "Confirm Exit" : `Manage ${activePartyType === 'req' ? 'Requesting' : 'Responding'} Party`}</h3>
              {!showConfirmExit && <FaTimes className="close-icon" onClick={handleCloseIconClick} />}
            </div>
            <div className="modal-body">
              {showConfirmExit ? (
                <div className="confirm-exit-view">
                  <FaExclamationTriangle className="warning-icon-large" />
                  <h3>Unsaved Changes</h3>
                  <p>Are you sure you want to cancel? Any names entered will be lost.</p>
                  <div className="modal-footer-dual">
                    <button className="modal-save-btn-small" onClick={() => setShowConfirmExit(false)} type="button">Go Back</button>
                    <button className="modal-cancel-btn" onClick={() => { setShowPartyModal(false); setShowConfirmExit(false); }} type="button">Yes, Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="party-section-box">
                    <h4 className="party-section-title">{activePartyType === 'req' ? 'Requesting Party' : 'Responding Party'}</h4>
                    <div className="party-list-scroll-container">
                      {(activePartyType === 'req' ? requestingParties : respondingParties).map((name, index) => (
                        <div key={index} className="party-input-row">
                          <input type="text" placeholder="Insert name" value={name} onChange={(e) => handlePartyNameChange(activePartyType, index, e.target.value)} />
                          <button className="party-delete-btn" onClick={() => handleRemoveParty(activePartyType, index)} type="button"><FaTrash /></button>
                        </div>
                      ))}
                    </div>
                    <button className="add-another-btn" onClick={() => handleAddParty(activePartyType)} type="button"><FaPlus /> Add Another</button>
                  </div>
                  <div className="modal-footer-dual">
                    <button className="modal-cancel-btn" onClick={() => setShowConfirmExit(true)} type="button">Cancel</button>
                    <button className="modal-save-btn-small" onClick={handleModalSave} type="button">Save</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="schedule-container">
        <div className="create-card">
          <h2 className="section-title">{editingId ? "Update Schedule" : "Create New Schedule"}</h2>
          
          <div className="input-group">
            <label>Purpose:</label>
            <input type="text" value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} className="sched-input" />
          </div>

          <div className="row-group">
            <div className="input-group">
              <label>Requesting Party:</label>
              <button className="manage-party-trigger" onClick={() => { setActivePartyType('req'); setShowPartyModal(true); }} type="button">Manage Party</button>
            </div>
            <div className="input-group">
              <label>Responding Party:</label>
              <button className="manage-party-trigger" onClick={() => { setActivePartyType('res'); setShowPartyModal(true); }} type="button">Manage Party</button>
            </div>
          </div>

          <div className="availability-horizontal-section">
            <label className="group-label">Availability:</label>
            <div className="availability-row">
              <div className="input-field"><span className="inline-label">Day</span>
                <select value={formData.selectedDay} onChange={(e) => setFormData({...formData, selectedDay: e.target.value})} className="sched-input compact">
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="input-field"><span className="inline-label">Month</span>
                <select value={formData.selectedMonth} onChange={(e) => setFormData({...formData, selectedMonth: e.target.value})} className="sched-input compact">
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="input-field time-field"><span className="inline-label">Time</span>
                <div className="time-range-row">
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="sched-input" />
                  <span>-</span>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="sched-input" />
                </div>
              </div>
            </div>
          </div>

          <div className="row-group">
            <div className="input-group">
              <label>Labor Violation / Claims:</label>
              <select className="sched-input" value={formData.laborViolation} onChange={(e) => setFormData({...formData, laborViolation: e.target.value})}>
                <option value="Select">Select</option>
                <option>Minimum Wage</option><option>COLA</option>
                <option>Night Shift Differential</option><option>Overtime Pay</option>
                <option>Holiday Pay</option><option>13th Month Pay</option>
                <option>Service Charge</option><option>Premium Pay for Rest Day</option>
                <option>Premium Pay for Special Day</option><option>Service Incentive Leave</option>
                <option>Maternity Leave</option><option>Paternity Leave</option>
                <option>Parental Leave for Solo Parent</option><option>Leave for Victims of VAWC</option>
                <option>Special Leave for Women</option>
              </select>
            </div>
            <div className="input-group">
              <label>Other Issues:</label>
              <input type="text" className="sched-input" value={formData.otherIssues} onChange={(e) => setFormData({...formData, otherIssues: e.target.value})} />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '15px' }}>
            <label>Available Hearing Officer</label>
            <input type="text" value={formData.officer} readOnly className="sched-input read-only-input" />
          </div>

          <div className="sched-button-group">
            <button className="create-btn" onClick={handleSubmit} type="button">
              {editingId ? "Update" : "Create"}
            </button>
            <button
              className="view-log-btn"
              onClick={() => { if(onShowLog) onShowLog(); }}
              type="button"
            >
              <FaHistory /> Activity Log
            </button>
          </div>
        </div>

        <div className="calendar-card fixed-calendar-card">
          <div className="calendar-header">
            <FaChevronLeft onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{cursor: 'pointer'}} />
            <h3>{monthName} {year}</h3>
            <FaChevronRight onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{cursor: 'pointer'}} />
          </div>
          <div className="calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="dow-label">{d}</div>)}
            {Array.from({ length: startingOffset }).map((_, i) => <div key={i}></div>)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={day} className={`day-num ${currentTime.getDate() === day && currentTime.getMonth() === month ? 'today-highlight' : ''}`}>{day}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;