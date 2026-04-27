import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles/MainSched.css';
import ActivityLog from './ActivityLog'; 
import DetailedScheduleForm from './Schedule'; 
import { 
  FaClock, 
  FaArrowLeft, 
  FaPlus,
  FaHistory,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const MainSched = ({ triggerToast, sidebarOpen = true }) => {
  const [showLog, setShowLog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [now, setNow] = useState(new Date()); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDay, setSelectedDay] = useState(new Date().getDate()); 
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadMeetings = useCallback(() => {
    const saved = localStorage.getItem('hearings');
    if (saved) {
      const allHearings = JSON.parse(saved);
      // Only keep hearings that are NOT Cancelled and NOT Done
      const activeOnly = allHearings.filter(h => h.status !== 'Cancelled' && h.status !== 'Done');
      setMeetings(activeOnly);
    } else {
      setMeetings([]);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
    window.addEventListener('focus', loadMeetings);
    window.addEventListener('storage', loadMeetings);
    return () => {
      window.removeEventListener('focus', loadMeetings);
      window.removeEventListener('storage', loadMeetings);
    };
  }, [isCreating, loadMeetings, showLog]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = months[month];
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startingOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const meetingDay = parseInt(m.day);
      const isSameDay = meetingDay === selectedDay;
      const isSameMonth = m.date?.toUpperCase().includes(monthName.substring(0, 3).toUpperCase());
      const isSameYear = m.year ? m.year === year : year === now.getFullYear();

      if (!isSameDay || !isSameMonth || !isSameYear) return false;

      // Final check: filter by time to ensure it's "Upcoming"
      try {
        const [timePart, modifier] = m.time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const meetingDateTime = new Date(year, month, meetingDay, hours, minutes);
        return meetingDateTime > now; 
      } catch (e) {
        return true; 
      }
    });
  }, [meetings, selectedDay, monthName, month, year, now]);

  if (showLog) {
    return (
      <ActivityLog 
        onBack={() => {
          setShowLog(false);
          loadMeetings(); 
        }} 
      />
    );
  }

  return (
    <div className={`schedule-outer-container ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
      <div className="schedule-header">
        <div className="header-left">
          {isCreating && (
            <button className="back-circle-btn" onClick={() => setIsCreating(false)}>
              <FaArrowLeft />
            </button>
          )}
          <div className="header-text">
            <h1>{isCreating ? "New Schedule" : "Schedule a Meeting"}</h1>
            {!isCreating && <p>Agenda for {monthName} {selectedDay}, {year}</p>}
          </div>
        </div>
        {!isCreating && (
          <button className="create-sched-btn" onClick={() => setIsCreating(true)}>
            <FaPlus /> Create Schedule
          </button>
        )}
      </div>

      <div className={isCreating ? "schedule-create-mode" : "schedule-content-grid"}>
        {isCreating ? (
          <DetailedScheduleForm 
            hideHeader={true} 
            onSuccess={() => {
              setIsCreating(false);
              loadMeetings(); 
            }} 
            onShowLog={() => setShowLog(true)} 
            triggerToast={triggerToast} 
          />
        ) : (
          <>
            <div className="left-column-wrapper">
              <div className="white-card meetings-card fixed-card-height">
                <h2 className="card-title">Upcoming Meetings</h2>
                <div className="meetings-list scrollable-agenda">
                  {filteredMeetings.length > 0 ? (
                    filteredMeetings.map((item) => {
                      const monthBadge = item.date ? item.date.substring(0, 3).toUpperCase() : "---";
                      return (
                        <div key={item.id} className="meeting-row">
                          <span className="time-label">{item.time}</span>
                          <div className="meeting-blue-pill">
                            <div className="pill-main-content">
                              <div className="meeting-date-badge">
                                <span>{monthBadge}</span>
                                <strong>{item.day}</strong>
                              </div>
                              <div className="meeting-info">
                                <h3>{item.title || item.purpose}</h3>
                                <p><FaClock /> {item.time}</p>
                              </div>
                            </div>
                            <button className="view-pill-btn" onClick={() => setShowLog(true)}>View</button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-meetings-placeholder">
                      <p>No more upcoming meetings for this day.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="right-column-wrapper">
              <div className="white-card calendar-mini-card fixed-card-height">
                <div className="cal-nav">
                  <FaChevronLeft onClick={() => setCurrentDate(new Date(year, month - 1, 1))} />
                  <h3>{monthName} {year}</h3>
                  <FaChevronRight onClick={() => setCurrentDate(new Date(year, month + 1, 1))} />
                </div>
                <div className="cal-grid-mini">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="cal-day-label">{d}</div>
                  ))}
                  {Array.from({ length: startingOffset }).map((_, i) => <div key={`off-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <div 
                      key={day} 
                      className={`cal-date 
                        ${selectedDay === day ? 'selected-highlight' : ''} 
                        ${now.getDate() === day && now.getMonth() === month && now.getFullYear() === year ? 'today-dot' : ''}
                      `}
                      onClick={() => setSelectedDay(day)}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              <div className="activity-log-trigger-card" onClick={() => setShowLog(true)}>
                <div className="trigger-content">
                  <div className="icon-wrapper"><FaHistory /></div>
                  <div className="text-wrapper">
                    <span className="label">System Records</span>
                    <h3>Activity Log</h3>
                  </div>
                </div>
                <div className="arrow-badge"><FaChevronRight /></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainSched;