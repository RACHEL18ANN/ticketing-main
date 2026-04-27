import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Component Imports
import SideBar from './pages/SideBar';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import ToastNotif from './pages/ToastNotif';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';
import Remarks from './pages/Remarks';
import Minutes from './pages/Minutes';
import MinutesInfo from './pages/MinutesInfo';
import MainSched from './pages/MainSched';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword'; // New Import

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Updated to include reset-password so the sidebar stays hidden
  const isAuthPage = ['/login', '/forgot-password', '/reset-password'].includes(location.pathname);

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')) || null);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const triggerToast = (msg, type = "success") => {
    setToast({ show: false, message: "", type: "success" });
    setTimeout(() => { setToast({ show: true, message: msg, type }); }, 10);
    setTimeout(() => { setToast(prev => ({ ...prev, show: false })); }, 3010);
  };

  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
    triggerToast("Profile updated successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const handleClearAll = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
    triggerToast("Notifications cleared", "info");
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Status Checker Logic
  useEffect(() => {
    const checkStatus = () => {
      const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
      const now = new Date();
      let hasUpdates = false;
      const updatedHearings = savedHearings.map(h => {
        if (h.status === 'Done') return h;
        try {
          const endTimeStr = h.time.split('to')[1].trim();
          const [time, mod] = endTimeStr.split(' ');
          let [hh, mm] = time.split(':');
          let hNum = parseInt(hh);
          if (mod.toLowerCase() === 'pm' && hNum !== 12) hNum += 12;
          if (mod.toLowerCase() === 'am' && hNum === 12) hNum = 0;
          const monthMap = { "JAN": 0, "FEB": 1, "MAR": 2, "APR": 3, "MAY": 4, "JUN": 5, "JUL": 6, "AUG": 7, "SEP": 8, "OCT": 9, "NOV": 10, "DEC": 11 };
          const dateParts = h.date.split(' ');
          const monthStr = dateParts[0].toUpperCase();
          const year = parseInt(dateParts[2]) || 2026;
          const hearingDate = new Date(year, monthMap[monthStr] || 0, parseInt(h.day), hNum, parseInt(mm));
          if (now > hearingDate) {
            hasUpdates = true;
            setNotifications(prev => {
              if (!prev.some(n => n.hearingId === h.id)) {
                triggerToast(`${h.title} Completed`);
                return [{ id: Date.now(), hearingId: h.id, title: h.title, officer: h.officer || "System", time: h.time, date: h.date, status: "green", isRead: false }, ...prev];
              }
              return prev;
            });
            return { ...h, status: 'Done' };
          }
        } catch (e) { console.error(e); }
        return h;
      });
      if (hasUpdates) localStorage.setItem('hearings', JSON.stringify(updatedHearings));
    };
    const interval = setInterval(checkStatus, 30000);
    checkStatus();
    return () => clearInterval(interval);
  }, []);

  // Auth Layout (No Sidebar)
  if (isAuthPage) {
    return (
      <>
        <ToastNotif toast={toast} setToast={setToast} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </>
    );
  }

  // Main App Layout (With Sidebar)
  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <ToastNotif toast={toast} setToast={setToast} />
      
      <SideBar 
        user={user} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        onLogout={handleLogout} 
      />

      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '260px' : '0', 
        transition: 'margin-left 0.3s ease-in-out',
        width: '100%',
        background: '#f4f7f6',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard user={user} notifications={notifications} onClearAll={handleClearAll} onMarkAsRead={handleMarkAsRead} />} />
          <Route path="/notifications" element={<Notifications notifications={notifications} isFullPage={true} onClearAll={handleClearAll} onMarkAsRead={handleMarkAsRead} />} />
          <Route path="/schedule" element={<MainSched triggerToast={triggerToast} />} />
          <Route path="/schedule-form" element={<Schedule triggerToast={triggerToast} />} />
          <Route path="/remarks" element={<Remarks />} />
          <Route path="/remarks/:id" element={<Remarks />} />
          <Route path="/settings" element={<Settings user={user} onSave={handleUpdateUser} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />} />
          <Route path="/edit-profile" element={<EditProfile user={user} onSave={handleUpdateUser} />} />
          <Route path="/minutes" element={<Minutes />} />
          <Route path="/minutes-info/:fileId" element={<MinutesInfo />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;