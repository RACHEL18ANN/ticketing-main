import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { FaTimes, FaDownload } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, LineChart, Line } from 'recharts';

const Dashboard = ({ user, notifications, onMarkAsRead, onClearAll }) => {
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);
  const [hearings, setHearings] = useState([]);
  
  // --- ENTRANCE ANIMATION STATE ---
  const [isVisible, setIsVisible] = useState(false);
  
  const now = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [selectedMonth, setSelectedMonth] = useState(monthNames[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [reportData, setReportData] = useState([]);

  // --- STATES FOR EARNINGS OVERVIEW ---
  const [earningsFrequency, setEarningsFrequency] = useState('Daily');
  const [earningsViewYear, setEarningsViewYear] = useState(now.getFullYear());
  const [earningsViewMonth, setEarningsViewMonth] = useState(now.getMonth());
  const [totalEarnings, setTotalEarnings] = useState({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  const [earningsTrend, setEarningsTrend] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [yearlyTrend, setYearlyTrend] = useState([]);
  const [fullEarningsData, setFullEarningsData] = useState({});

  const currentName = user?.firstName || "User";

  const reportMonths = [
    { name: 'January', key: 'JAN' }, { name: 'February', key: 'FEB' },
    { name: 'March', key: 'MAR' }, { name: 'April', key: 'APR' },
    { name: 'May', key: 'MAY' }, { name: 'June', key: 'JUN' },
    { name: 'July', key: 'JUL' }, { name: 'August', key: 'AUG' },
    { name: 'September', key: 'SEP' }, { name: 'October', key: 'OCT' },
    { name: 'November', key: 'NOV' }, { name: 'December', key: 'DEC' }
  ];

  // --- TRIGGER ENTRANCE ANIMATION ON MOUNT ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadData = () => {
      const savedData = JSON.parse(localStorage.getItem('hearings')) || [];
      setHearings(savedData);
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // --- BUILD COMPLETE HISTORICAL EARNINGS DATA ---
  useEffect(() => {
    const buildHistoricalData = () => {
      const allFiles = JSON.parse(localStorage.getItem('allMinutesFiles')) || [];
      const historicalData = {};
      
      // Initialize structure for years 2020-2030
      for (let year = 2020; year <= 2030; year++) {
        historicalData[year] = {};
        for (let month = 0; month < 12; month++) {
          historicalData[year][month] = {
            total: 0,
            days: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, income: 0 }))
          };
        }
      }

      allFiles.forEach(file => {
        if (file.conferences && Array.isArray(file.conferences)) {
          file.conferences.forEach(conf => {
            const amount = parseFloat(conf.amountPaid) || 0;
            
            if (conf.date && amount > 0) {
              const cDate = new Date(conf.date);
              
              if (!isNaN(cDate.getTime())) {
                const confYear = cDate.getFullYear();
                const confMonth = cDate.getMonth();
                const confDay = cDate.getDate();
                
                if (historicalData[confYear] && historicalData[confYear][confMonth]) {
                  historicalData[confYear][confMonth].total += amount;
                  if (historicalData[confYear][confMonth].days[confDay - 1]) {
                    historicalData[confYear][confMonth].days[confDay - 1].income += amount;
                  }
                }
              }
            }
          });
        }
      });

      setFullEarningsData(historicalData);
    };

    buildHistoricalData();
  }, []);

  // --- UPDATE DISPLAYED EARNINGS BASED ON SELECTED YEAR/MONTH/FREQUENCY ---
  useEffect(() => {
    const updateEarningsDisplay = () => {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Calculate current day earnings (today)
      let dailyEarnings = 0;
      if (fullEarningsData[currentYear] && fullEarningsData[currentYear][currentMonth]) {
        const todayDay = today.getDate();
        const todayData = fullEarningsData[currentYear][currentMonth].days[todayDay - 1];
        if (todayData) {
          dailyEarnings = todayData.income;
        }
      }

      // Calculate current week earnings (Mon-Sun)
      let weeklyEarnings = 0;
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      startOfWeek.setDate(today.getDate() + diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Calculate weekly trend
      const weeklyDays = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dYear = date.getFullYear();
        const dMonth = date.getMonth();
        const dDay = date.getDate();
        
        let dayIncome = 0;
        if (fullEarningsData[dYear] && fullEarningsData[dYear][dMonth]) {
          const dayData = fullEarningsData[dYear][dMonth].days[dDay - 1];
          if (dayData) {
            dayIncome = dayData.income;
            weeklyEarnings += dayIncome;
          }
        }
        
        weeklyDays.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: date.toDateString(),
          income: dayIncome
        });
      }
      setWeeklyTrend(weeklyDays);

      // Calculate yearly earnings for selected view year
      let yearlyEarnings = 0;
      const yearlyTrendData = Array.from({ length: 12 }, (_, i) => ({ 
        month: monthNames[i], 
        income: 0 
      }));
      
      if (fullEarningsData[earningsViewYear]) {
        for (let month = 0; month < 12; month++) {
          const monthTotal = fullEarningsData[earningsViewYear][month].total;
          yearlyTrendData[month].income = monthTotal;
          yearlyEarnings += monthTotal;
        }
      }
      setYearlyTrend(yearlyTrendData);

      // Calculate monthly earnings for selected view month/year
      let monthlyEarnings = 0;
      let monthlyTrendData = Array.from({ length: 31 }, (_, i) => ({ day: i + 1, income: 0 }));
      
      if (fullEarningsData[earningsViewYear] && fullEarningsData[earningsViewYear][earningsViewMonth]) {
        monthlyTrendData = fullEarningsData[earningsViewYear][earningsViewMonth].days;
        monthlyEarnings = fullEarningsData[earningsViewYear][earningsViewMonth].total;
      }
      setEarningsTrend(monthlyTrendData);

      setTotalEarnings({ 
        daily: dailyEarnings, 
        weekly: weeklyEarnings, 
        monthly: monthlyEarnings, 
        yearly: yearlyEarnings 
      });
    };

    updateEarningsDisplay();
  }, [fullEarningsData, earningsViewYear, earningsViewMonth]);

  useEffect(() => {
    const processGraphData = () => {
      const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
      const dailyCounts = Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        clients: 0 
      }));

      savedHearings.forEach(h => {
        if (h.status?.toLowerCase() === 'done') {
          let hMonth = "";
          let hDay = 0;
          let hYear = parseInt(h.year || 2026);

          if (h.date && h.date.includes(' ')) {
            const parts = h.date.split(' ');
            const monthMap = { 
              'JAN':'January','FEB':'February','MAR':'March','APR':'April','MAY':'May','JUN':'June',
              'JUL':'July','AUG':'August','SEP':'September','OCT':'October','NOV':'November','DEC':'December' 
            };
            hMonth = monthMap[parts[0].toUpperCase()];
            hDay = parseInt(parts[1]);
          } else {
            hMonth = h.monthName;
            hDay = parseInt(h.day);
          }

          if (hMonth === selectedMonth && hYear === selectedYear) {
            if (dailyCounts[hDay - 1]) {
              dailyCounts[hDay - 1].clients += 1;
            }
          }
        }
      });
      setReportData(dailyCounts);
    };

    processGraphData();
    window.addEventListener('storage', processGraphData);
    return () => window.removeEventListener('storage', processGraphData);
  }, [selectedMonth, selectedYear]);

  const renderCustomLabel = ({ x, y, width, value }) => {
    if (value === 0) return null;
    return (
      <text x={x + width / 2} y={y - 10} fill="#666" textAnchor="middle" fontSize="12" fontWeight="bold">
        {value}
      </text>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- EXPORT EARNINGS DATA AS CSV ---
  const exportEarningsCSV = () => {
    let csvContent = "Year,Month,Day,Income\n";
    
    // Export all years from 2020 to 2030
    for (let year = 2020; year <= 2030; year++) {
      if (fullEarningsData[year]) {
        for (let month = 0; month < 12; month++) {
          if (fullEarningsData[year][month]) {
            const monthData = fullEarningsData[year][month];
            monthData.days.forEach(dayData => {
              if (dayData.income > 0) {
                csvContent += `${year},${monthNames[month]},${dayData.day},${dayData.income}\n`;
              }
            });
          }
        }
      }
    }
    
    // Also add monthly totals
    csvContent += "\nMonthly Totals\n";
    csvContent += "Year,Month,Total Income\n";
    for (let year = 2020; year <= 2030; year++) {
      if (fullEarningsData[year]) {
        for (let month = 0; month < 12; month++) {
          if (fullEarningsData[year][month]) {
            const monthTotal = fullEarningsData[year][month].total;
            if (monthTotal > 0) {
              csvContent += `${year},${monthNames[month]},${monthTotal}\n`;
            }
          }
        }
      }
    }
    
    // Add yearly totals
    csvContent += "\nYearly Totals\n";
    csvContent += "Year,Total Income\n";
    for (let year = 2020; year <= 2030; year++) {
      let yearTotal = 0;
      if (fullEarningsData[year]) {
        for (let month = 0; month < 12; month++) {
          if (fullEarningsData[year][month]) {
            yearTotal += fullEarningsData[year][month].total;
          }
        }
      }
      if (yearTotal > 0) {
        csvContent += `${year},${yearTotal}\n`;
      }
    }
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `earnings_overview_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get chart data based on selected frequency
  const getChartData = () => {
    switch(earningsFrequency.toLowerCase()) {
      case 'daily':
        const today = new Date();
        const todayEarnings = totalEarnings.daily;
        return [{ day: `Today (${today.toLocaleDateString()})`, income: todayEarnings }];
      
      case 'weekly':
        return weeklyTrend;
      
      case 'monthly':
        return earningsTrend;
      
      case 'yearly':
        return yearlyTrend;
      
      default:
        return earningsTrend;
    }
  };

  // Get X-axis data key based on frequency
  const getXAxisDataKey = () => {
    switch(earningsFrequency.toLowerCase()) {
      case 'daily': return 'day';
      case 'weekly': return 'label';
      case 'monthly': return 'day';
      case 'yearly': return 'month';
      default: return 'day';
    }
  };

  // Get Y-axis domain based on frequency
  const getYAxisDomain = () => {
    const chartData = getChartData();
    const maxIncome = Math.max(...chartData.map(d => d.income), 100);
    return [0, Math.ceil(maxIncome / 100) * 100 + 100];
  };

  // Get Y-axis ticks based on frequency
  const getYAxisTicks = () => {
    const maxIncome = Math.max(...getChartData().map(d => d.income), 100);
    const step = Math.ceil(maxIncome / 5 / 100) * 100;
    const ticks = [];
    for (let i = 0; i <= maxIncome + step; i += step) {
      ticks.push(i);
    }
    return ticks.length > 1 ? ticks : [0, maxIncome];
  };

  // Get the current earnings total based on selected frequency
  const getCurrentEarningsTotal = () => {
    switch(earningsFrequency.toLowerCase()) {
      case 'daily': 
        return totalEarnings.daily;
      case 'weekly': 
        return totalEarnings.weekly;
      case 'monthly': 
        return totalEarnings.monthly;
      case 'yearly': 
        return totalEarnings.yearly;
      default: 
        return 0;
    }
  };

  // Get chart title based on frequency and selected period
  const getChartTitle = () => {
    switch(earningsFrequency.toLowerCase()) {
      case 'daily':
        return 'Today\'s Income';
      case 'weekly':
        return 'Weekly Income (Calendar Week: Mon-Sun)';
      case 'monthly':
        return `Monthly Income (${monthNames[earningsViewMonth]} ${earningsViewYear})`;
      case 'yearly':
        return `Yearly Income (${earningsViewYear})`;
      default:
        return `${earningsFrequency} Income Report`;
    }
  };

  return (
    <div className="dashboard-container">
      {showPanel && <div className="overlay" onClick={() => setShowPanel(false)} />}
      
      <div className={`side-notif-panel ${showPanel ? 'open' : ''}`}>
        <div className="side-panel-header">
          <h3>Notifications ({unreadCount})</h3>
          <button className="close-panel-btn" onClick={() => setShowPanel(false)}><FaTimes /></button>
        </div>
        
        <div className="side-panel-content">
          <div className="notif-scroll-area">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className={`side-notif-item ${n.isRead ? 'read' : 'unread'}`} onClick={() => !n.isRead && onMarkAsRead(n.id)}>
                  <p><strong>{n.title}</strong></p>
                  <small>{n.date}</small>
                </div>
              ))
            ) : <div className="empty-notifs">No new notifications</div>}
          </div>
        </div>

        <div className="side-panel-footer">
          <button className="footer-action-btn" onClick={() => { navigate('/notifications'); setShowPanel(false); }}>
            See All Notifications
          </button>
          <button className="footer-action-btn clear-btn" onClick={onClearAll}>Clear All</button>
        </div>
      </div>

      <main className="dashboard-content">
        {/* --- ANIMATED WELCOME HEADER --- */}
        <header className={`dashboard-header-main welcome-entrance ${isVisible ? 'visible' : ''}`}>
          <div className="welcome-section">
            <h1>Hello {currentName},</h1>
            <p>Your successful sessions report.</p>
          </div>
        </header>

        <div className="quick-actions">
          <div className="action-card yellow" onClick={() => navigate('/schedule')}>
            <div className="action-icon">📅</div>
            <span>Schedule</span>
          </div>
          <div className="action-card navy" onClick={() => setShowPanel(true)}>
            <div className="action-icon">🔔 {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}</div>
            <span>Notifications</span>
          </div>
        </div>

        <section className="summary-section">
          <h2>Report Summary</h2>
          <div className="summary-grid">
            {reportMonths.map((m) => (
              <div key={m.name} className="month-card">
                <div className="month-count">
                  {hearings.filter(h => (h.date?.toUpperCase().includes(m.key) || h.monthName === m.name) && h.status?.toLowerCase() === 'done').length}
                </div>
                <div className="month-label">{m.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="daily-report-section">
          <div className="reports-header-container">
            <h2 className="reports-title">Daily Report Graph</h2>
            <div className="reports-filters">
              <select className="month-dropdown" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="month-dropdown" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="reports-main-card shadow-glow">
            <div className="reports-grid-layout">
              <div className="officer-summary">
                <div className="officer-avatar-wrapper">
                  {user?.profilePic ? <img src={user.profilePic} alt="PFP" /> : <div className="avatar-placeholder">?</div>}
                </div>
                <h3 className="officer-name">{user?.lastName}, {user?.firstName}</h3>
                <p className="officer-role">SR. LEO</p>
              </div>

              <div className="graph-section-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={reportData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} width={30} />
                    <Tooltip />
                    <Bar dataKey="clients" fill="#030a49" radius={[10, 10, 0, 0]} barSize={15}>
                      <LabelList dataKey="clients" content={renderCustomLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* --- EARNINGS OVERVIEW SECTION --- */}
        <section className="earnings-overview-section">
          <div className="earnings-header-with-actions">
            <h2 className="reports-title">Earnings Overview</h2>
            <button className="export-csv-btn" onClick={exportEarningsCSV} title="Download all earnings data as CSV">
              <FaDownload /> Download Data
            </button>
          </div>
          
          <div className="earnings-frequency-card shadow-glow">
            <p className="frequency-label">Report Frequency</p>
            <div className="frequency-toggle-group">
              {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((freq) => (
                <button 
                  key={freq} 
                  className={`freq-btn ${earningsFrequency === freq ? 'active' : ''}`}
                  onClick={() => setEarningsFrequency(freq)}
                >
                  {freq}
                </button>
              ))}
            </div>
            
            {/* Year/Month Selectors - Show when Monthly or Yearly is selected */}
            <div className="period-selectors">
              {(earningsFrequency === 'Monthly' || earningsFrequency === 'Yearly') && (
                <div className="select-group">
                  <label>Year:</label>
                  <select 
                    className="period-dropdown"
                    value={earningsViewYear}
                    onChange={(e) => setEarningsViewYear(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {earningsFrequency === 'Monthly' && (
                <div className="select-group">
                  <label>Month:</label>
                  <select 
                    className="period-dropdown"
                    value={earningsViewMonth}
                    onChange={(e) => setEarningsViewMonth(parseInt(e.target.value))}
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="earnings-report-main-card shadow-glow">
            <div className="earnings-header">
              <h3 className="earnings-subtitle">{getChartTitle()}</h3>
            </div>

            {/* Total Earnings Display */}
            <div className="earnings-total-display">
              <span className="total-label">
                Total {earningsFrequency} Earnings:
              </span>
              <span className="total-amount">
                ₱{getCurrentEarningsTotal().toLocaleString()}
              </span>
            </div>

            <div className="earnings-graph-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={getChartData()} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid 
                    strokeDasharray="0" 
                    vertical={false} 
                    stroke="#f0f0f0" 
                  />
                  <XAxis 
                    dataKey={getXAxisDataKey()} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#1a1a1a' }} 
                    axisLine={{ stroke: '#e0e0e0' }} 
                    tickLine={false}
                    interval={earningsFrequency.toLowerCase() === 'monthly' ? Math.floor(31 / 8) : 0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#003399' }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                    width={70}
                    domain={getYAxisDomain()}
                    ticks={getYAxisTicks()}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '10px', 
                      border: '1px solid #e0e0e0', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: '#fff'
                    }}
                    formatter={(value) => [`₱${value.toLocaleString()}`, 'Earnings']}
                    labelFormatter={(label, payload) => {
                      const freq = earningsFrequency.toLowerCase();
                      if (freq === 'daily') return label;
                      if (freq === 'weekly') return `Day: ${label}`;
                      if (freq === 'monthly') return `Day ${label}`;
                      if (freq === 'yearly') return label;
                      return label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#00b300" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#ffffff', strokeWidth: 2, stroke: '#00b300' }}
                    activeDot={{ r: 7, fill: '#00b300', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Help text to explain what each view shows */}
            <div style={{
              marginTop: '15px',
              padding: '10px',
              fontSize: '0.75rem',
              color: '#888',
              textAlign: 'center',
              borderTop: '1px solid #eee'
            }}>
              {earningsFrequency === 'Daily' && '📅 Showing today\'s earnings only'}
              {earningsFrequency === 'Weekly' && '📊 Showing earnings for the current calendar week (Mon-Sun)'}
              {earningsFrequency === 'Monthly' && `📈 Showing daily earnings for ${monthNames[earningsViewMonth]} ${earningsViewYear}`}
              {earningsFrequency === 'Yearly' && `📆 Showing monthly earnings for ${earningsViewYear}`}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;