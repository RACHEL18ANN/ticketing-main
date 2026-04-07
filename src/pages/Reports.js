import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LabelList 
} from 'recharts';
import "../styles/Reports.css";

const Reports = ({ user }) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const fetchAndProcessData = () => {
      // 1. Fetch hearings from localStorage
      const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];

      // 2. Initialize the 31-day structure
      const dailyCounts = Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        clients: 0 
      }));

      // Map for short month strings to full month names
      const monthMap = {
        'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
        'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
        'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
      };

      // 3. Process hearings
      savedHearings.forEach(hearing => {
        // Extract Month and Day from "MAR 10" format
        const dateParts = hearing.date?.split(' ');
        if (!dateParts || dateParts.length < 2) return;

        const shortMonth = dateParts[0].toUpperCase();
        const fullMonthName = monthMap[shortMonth];
        const day = parseInt(hearing.day || dateParts[1]);
        
        // Check if hearing is 'Done' and matches filters
        const isDone = hearing.status?.toLowerCase() === 'done' || hearing.status?.toLowerCase() === 'completed';
        
        if (
          isDone && 
          fullMonthName === selectedMonth && 
          parseInt(selectedYear) === 2026 // Matching the 2026 system logic
        ) {
          if (dailyCounts[day - 1]) {
            dailyCounts[day - 1].clients += 1;
          }
        }
      });

      setReportData(dailyCounts);
    };

    fetchAndProcessData();

    // Listen for storage updates (triggered by App.js watcher)
    window.addEventListener('storage', fetchAndProcessData);
    return () => window.removeEventListener('storage', fetchAndProcessData);

  }, [selectedMonth, selectedYear]); 

  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    if (value === 0) return null; 
    return (
      <text 
        x={x + width / 2} 
        y={y - 10} 
        fill="#718096" 
        textAnchor="middle" 
        style={{ fontSize: '12px', fontWeight: '600' }}
      >
        {value}
      </text>
    );
  };

  return (
    <div className="reports-page">
      <div className="reports-header-container">
        <h1 className="reports-title">Daily Report</h1>
        <div className="reports-filters">
          <div className="reports-select-group">
            <span>Select Month: </span>
            <select 
              className="month-dropdown" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="reports-select-group">
            <span>Select Year: </span>
            <select 
              className="month-dropdown" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="reports-main-card shadow-glow">
        <div className="reports-grid-layout">
          <div className="officer-summary">
            <div className="officer-avatar-wrapper">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Officer" />
              ) : (
                <div className="avatar-placeholder">?</div>
              )}
            </div>
            <h3 className="officer-name">
              {user?.lastName || "Officer"}, {user?.firstName || "User"}
            </h3>
            <p className="officer-role">SR. LEO</p>
            <p className="officer-email-text">{user?.email}</p>
          </div>

          <div className="graph-section-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d1d5db" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#333', fontSize: 10 }} 
                />
                <YAxis 
                  domain={[0, 20]} // Fixed number from 0 to 20
                  tickCount={11}  // Shows increments of 2 (0, 2, 4... 20) for better spacing
                  axisLine={false} 
                  tickLine={false} 
                  width={40} 
                  style={{ fontSize: '11px', fill: '#666' }}
                />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="clients" fill="#030a49" radius={[15, 15, 0, 0]} barSize={14}>
                  <LabelList dataKey="clients" content={renderCustomizedLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;