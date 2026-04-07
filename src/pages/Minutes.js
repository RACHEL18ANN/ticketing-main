import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import "../styles/Minutes.css";
import { 
  FaSearch, 
  FaFileAlt, 
  FaEllipsisV, 
  FaChevronLeft, 
  FaChevronRight, 
  FaTrashAlt,
  FaArchive,
  FaCalendarCheck,
  FaUserTie,
  FaInbox 
} from "react-icons/fa";

const Minutes = () => {
  const navigate = useNavigate(); 
  
  // --- States ---
  const [documents, setDocuments] = useState([]);
  const [hearings, setHearings] = useState([]); // Loaded from Activity Log
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("select");
  const [showModal, setShowModal] = useState(false);
  const [selectedHearingId, setSelectedHearingId] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [isSelectionMode, setIsSelectionMode] = useState(false); 
  const itemsPerPage = 12;

  // --- Real-time Logic (Kept) ---
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const uploadedAt = new Date(timestamp);
    const diffInSeconds = Math.floor((now - uploadedAt) / 1000);
    if (diffInSeconds < 60) return "Uploaded just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Uploaded ${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Uploaded ${diffInHours} hours ago`;
    return uploadedAt.toLocaleDateString();
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    const interval = setInterval(forceUpdate, 60000);
    return () => clearInterval(interval);
  }, [forceUpdate]);

  // --- Data Persistence Logic ---
  useEffect(() => {
    const savedDocs = JSON.parse(localStorage.getItem("minutes_data")) || [];
    const savedHearings = JSON.parse(localStorage.getItem("hearings")) || [];
    setDocuments(savedDocs);
    setHearings(savedHearings);
  }, []);

  useEffect(() => {
    localStorage.setItem("minutes_data", JSON.stringify(documents));
  }, [documents]);

  // --- Handlers ---
  const handleCreateFromHearing = () => {
    if (!selectedHearingId) {
      alert("Please select a hearing first.");
      return;
    }

    const linkedHearing = hearings.find(h => h.id.toString() === selectedHearingId.toString());
    
    // Auto-increment "Minute <n>" logic
    const minuteNumbers = documents
      .map(doc => {
        const match = doc.id.match(/Minute (\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
    const nextNumber = minuteNumbers.length > 0 ? Math.max(...minuteNumbers) + 1 : 1;

    const newFile = {
      id: `Minute ${nextNumber}`, 
      hearingTitle: linkedHearing.title,
      officer: linkedHearing.officer,
      hearingDate: linkedHearing.date,
      timestamp: new Date().toISOString(),
      status: "select",
      selected: false
    };

    setDocuments(prev => [newFile, ...prev]);
    setSelectedHearingId("");
    setShowModal(false);
  };

  const toggleSelect = (id) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, selected: !doc.selected } : doc
    ));
  };

  const handleSelectAll = () => {
    const allSelected = filteredDocs.every(doc => doc.selected);
    setDocuments(prev => prev.map(doc => {
      const isFiltered = filteredDocs.find(f => f.id === doc.id);
      return isFiltered ? { ...doc, selected: !allSelected } : doc;
    }));
  };

  const handleDeleteSelected = () => {
    const selectedCount = documents.filter(d => d.selected).length;
    if (selectedCount === 0) {
      alert("Please select files first by clicking 'Select All' or enabling selection mode.");
      return;
    }
    if (window.confirm(`Delete ${selectedCount} selected items?`)) {
      setDocuments(prev => prev.filter(doc => !doc.selected));
      setIsSelectionMode(false);
    }
  };

  // --- Search & Filter Logic ---
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.hearingTitle && doc.hearingTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === "select" || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage));

  return (
    <div className="minutes-page">
      {/* Modal Selection */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <FaCalendarCheck className="modal-upload-icon" />
              <span>Link Minute to Hearing</span>
            </div>
            
            <p className="modal-instruction">Select a hearing from the Activity Log:</p>
            
            <select 
              className="modal-select-dropdown" 
              value={selectedHearingId} 
              onChange={(e) => setSelectedHearingId(e.target.value)}
            >
              <option value="">-- Choose Hearing --</option>
              {hearings.length > 0 ? (
                hearings.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.title} ({h.date})
                  </option>
                ))
              ) : (
                <option disabled>No hearings found</option>
              )}
            </select>

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button 
                className="modal-btn-create" 
                onClick={handleCreateFromHearing}
                disabled={!selectedHearingId}
              >
                Create Entry
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="minutes-header">
        <h1>Minutes of Case Proceedings</h1>
        <p>View, manage, and track all client session minutes.</p>
      </header>

      <div className="action-bar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Minute # or Title..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="button-group">
          <button className="btn-add" onClick={() => setShowModal(true)}>ADD MINUTE</button>
          <button 
            className={`btn-select ${isSelectionMode ? "active-mode" : ""}`} 
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (!isSelectionMode) handleSelectAll();
            }}
          >
            {isSelectionMode ? "EXIT SELECT" : "SELECT ALL"}
          </button>
          <button className="btn-delete" onClick={handleDeleteSelected}>DELETE</button>
        </div>
      </div>

      <div className="filter-container">
        <span className="filter-label">Filter By:</span>
        <select className="filter-dropdown" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="select">All Status</option>
          <option value="settled">Settled</option>
          <option value="lack_of_interest">Lack of Interest</option>
          <option value="approval">Approval for Indorsement</option>
        </select>
      </div>

      <div className="grid-container-fixed">
        <div className="doc-grid-scroll-area">
          {currentItems.length > 0 ? (
            <div className="doc-grid">
              {currentItems.map((doc) => (
                <div 
                  key={doc.id} 
                  className={`document-card ${doc.selected ? "is-selected" : ""}`} 
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleSelect(doc.id);
                    } else {
                      navigate(`/minutes-info/${doc.id}`, { state: { rfaData: doc } });
                    }
                  }}
                >
                  <div className="card-left">
                    <FaFileAlt className={`doc-icon ${doc.status}`} />
                    <div className="doc-details">
                      <span className="doc-id">{doc.id}</span>
                      <div className="doc-meta-info">
                        <span className="hearing-subtext">{doc.hearingTitle}</span>
                        <span><FaUserTie /> {doc.officer}</span>
                        <span>{getRelativeTime(doc.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="options-menu" onClick={(e) => e.stopPropagation()}>
                    <FaEllipsisV className="doc-options" />
                    <div className="dropdown-menu">
                      <button onClick={() => navigate(`/minutes-info/${doc.id}`)}><FaFileAlt /> View Details</button>
                      <button onClick={() => alert("Archive " + doc.id)}><FaArchive /> Archive</button>
                      <button className="delete-opt" onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}><FaTrashAlt /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-container">
              <FaInbox className="empty-icon" />
              <h3>No Minutes Recorded</h3>
              <p>It looks like there are no minutes recorded yet. Click <strong>ADD MINUTE</strong> to link a proceeding from the Activity Log.</p>
            </div>
          )}
        </div>

        <footer className="grid-footer">
          <div className="pagination-controls">
            <FaChevronLeft 
              className={`arrow ${currentPage === 1 ? 'disabled' : ''}`} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            />
            {[...Array(totalPages)].map((_, i) => (
              <span 
                key={i} 
                className={`page-num ${currentPage === i + 1 ? 'active' : ''}`} 
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </span>
            ))}
            <FaChevronRight 
              className={`arrow ${currentPage === totalPages ? 'disabled' : ''}`} 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Minutes;