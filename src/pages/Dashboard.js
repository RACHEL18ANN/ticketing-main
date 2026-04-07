import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { FaTimes } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const Dashboard = ({ user, notifications, onMarkAsRead, onClearAll }) => {
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);
  const [hearings, setHearings] = useState([]);
  
  // Real-time Date and Time State
  const [dateTime, setDateTime] = useState(new Date());

  // Report section state
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [reportData, setReportData] = useState([]);
  
  // Update time every second to show seconds like the photo
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeParts = (date) => {
    const hours = ((date.getHours() % 12) || 12).toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return { hours, minutes, seconds, ampm };
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  };

  const formatFooterDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  // Name Logic
  const [currentName, setCurrentName] = useState(() => {
    if (user?.firstName) return user.firstName;
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      return savedUser?.firstName || "User";
    } catch (e) {
      return "User";
    }
  });

  const reportMonths = [
    { name: 'January', key: 'JAN' }, { name: 'February', key: 'FEB' },
    { name: 'March', key: 'MAR' }, { name: 'April', key: 'APR' },
    { name: 'May', key: 'MAY' }, { name: 'June', key: 'JUN' },
    { name: 'July', key: 'JUL' }, { name: 'August', key: 'AUG' },
    { name: 'September', key: 'SEP' }, { name: 'October', key: 'OCT' },
    { name: 'November', key: 'NOV' }, { name: 'December', key: 'DEC' }
  ];

  useEffect(() => {
    if (user?.firstName) {
      setCurrentName(user.firstName);
    } else {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser?.firstName) {
        setCurrentName(savedUser.firstName);
      }
    }
  }, [user]);

  useEffect(() => {
    const loadData = () => {
      const savedData = JSON.parse(localStorage.getItem('hearings')) || [];
      setHearings(savedData);
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser?.firstName) setCurrentName(savedUser.firstName);
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    const fetchAndProcessData = () => {
      const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
      const dailyCounts = Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        clients: 0 
      }));

      const monthMap = {
        'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
        'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
        'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
      };

      savedHearings.forEach(hearing => {
        const dateParts = hearing.date?.split(' ');
        if (!dateParts || dateParts.length < 2) return;

        const shortMonth = dateParts[0].toUpperCase();
        const fullMonthName = monthMap[shortMonth];
        const day = parseInt(hearing.day || dateParts[1]);
        const isDone = hearing.status?.toLowerCase() === 'done' || hearing.status?.toLowerCase() === 'completed';
        
        if (isDone && fullMonthName === selectedMonth && parseInt(selectedYear) === 2026) {
          if (dailyCounts[day - 1]) {
            dailyCounts[day - 1].clients += 1;
          }
        }
      });
      setReportData(dailyCounts);
    };

    fetchAndProcessData();
    window.addEventListener('storage', fetchAndProcessData);
    return () => window.removeEventListener('storage', fetchAndProcessData);
  }, [selectedMonth, selectedYear]);

  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    if (value === 0) return null; 
    return (
      <text x={x + width / 2} y={y - 10} fill="#718096" textAnchor="middle" style={{ fontSize: '12px', fontWeight: '600' }}>
        {value}
      </text>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const timeParts = getTimeParts(dateTime);

  return (
    <div className="dashboard-container">
      {showPanel && <div className="overlay" onClick={() => setShowPanel(false)} />}

      <div className={`side-notif-panel ${showPanel ? 'open' : ''}`}>
        <div className="side-panel-header">
          <h3>Notifications ({unreadCount})</h3>
          <button className="close-panel-btn" onClick={() => setShowPanel(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="side-panel-content">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className={`side-notif-item ${n.isRead ? 'read' : 'unread'}`} onClick={() => !n.isRead && onMarkAsRead(n.id)}>
                <p><strong>{n.title}</strong></p>
                <small>{n.date}</small>
              </div>
            ))
          ) : (
            <div className="empty-notifs">No new notifications</div>
          )}
        </div>
        <div className="side-panel-footer">
          <button className="footer-action-btn" onClick={() => navigate('/notifications')}>See All</button>
          <button className="footer-action-btn clear-btn" onClick={onClearAll}>Clear All</button>
        </div>
      </div>

      <main className="dashboard-content">
        {/* RESTRUCTURED HEADER TO ALLOW SIDE-BY-SIDE LAYOUT */}
        <header className="dashboard-header-main">
          <div className="welcome-section">
            <h1>Hello {currentName},</h1>
            <p>What's on the agenda for today?</p>
          </div>

          <div className="datetime-display-card">
            <div className="clock-time">
              {timeParts.hours}:{timeParts.minutes}:{timeParts.seconds} {timeParts.ampm}
            </div>
            <div className="month-box">
              <span className="footer-date">{formatFooterDate(dateTime)}</span>
            </div>
          </div>
        </header>

        <div className="quick-actions">
          <div className="action-card yellow" onClick={() => navigate('/schedule')}>
            <div className="action-icon">📅</div>
            <span>Schedule</span>
          </div>

          <div className="action-card navy" onClick={() => setShowPanel(true)}>
            <div className="action-icon">
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </div>
            <span>Notifications</span>
          </div>
        </div>

        <section className="summary-section">
          <h2>Report Summary</h2>
          <div className="summary-grid">
            {reportMonths.map((m) => (
              <div key={m.name} className="month-card">
                <div className="month-count">
                  {hearings.filter(h => h.date?.toUpperCase().includes(m.key)).length}
                </div>
                <div className="month-label">{m.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="daily-report-section">
          <div className="reports-header-container">
            <h2 className="reports-title">Daily Report</h2>
            <div className="reports-filters">
              <div className="reports-select-group">
                <span>Select Month:</span>
                <select className="month-dropdown" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="reports-select-group">
                <span>Select Year:</span>
                <select className="month-dropdown" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="reports-main-card shadow-glow">
            <div className="reports-grid-layout">
              <div className="officer-summary">
                <div className="officer-avatar-wrapper">
                  {user?.profilePic ? <img src={user.profilePic} alt="Officer" /> : <div className="avatar-placeholder">?</div>}
                </div>
                <h3 className="officer-name">{user?.lastName || "Officer"}, {user?.firstName || "User"}</h3>
                <p className="officer-role">SR. LEO</p>
                <p className="officer-email-text">{user?.email}</p>
              </div>

              <div className="graph-section-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d1d5db" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#333', fontSize: 10 }} />
                    <YAxis domain={[0, 20]} tickCount={11} axisLine={false} tickLine={false} width={40} style={{ fontSize: '11px', fill: '#666' }} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="clients" fill="#030a49" radius={[15, 15, 0, 0]} barSize={14}>
                      <LabelList dataKey="clients" content={renderCustomizedLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;