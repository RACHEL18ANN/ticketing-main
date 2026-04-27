import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "../styles/Minutes.css";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const location = useLocation();
  
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("allMinutesFiles");
    return saved ? JSON.parse(saved) : [];
  });

  const [hearings] = useState(() => {
    const saved = localStorage.getItem("hearings");
    if (!saved) return [];
    const allHearings = JSON.parse(saved);
    return allHearings.filter(h => {
      const status = h.status?.toLowerCase();
      return status !== "cancelled" && status !== "pending";
    });
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [showModal, setShowModal] = useState(false);
  const [selectedHearingId, setSelectedHearingId] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [isSelectionMode, setIsSelectionMode] = useState(false); 
  const [highlightId, setHighlightId] = useState(null); 
  const itemsPerPage = 12;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idToHighlight = params.get('highlight');
    if (idToHighlight && documents.length > 0) {
      const itemIndex = documents.findIndex(d => String(d.id) === String(idToHighlight));
      if (itemIndex !== -1) {
        const targetPage = Math.ceil((itemIndex + 1) / itemsPerPage);
        setCurrentPage(targetPage);
        setHighlightId(idToHighlight);
        const timer = setTimeout(() => {
          setHighlightId(null); 
          navigate('/minutes', { replace: true }); 
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [location.search, documents, navigate]);

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const now = new Date();
    const uploadedAt = new Date(timestamp);
    const diffInSeconds = Math.floor((now - uploadedAt) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    return uploadedAt.toLocaleDateString();
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    const interval = setInterval(forceUpdate, 60000);
    return () => clearInterval(interval);
  }, [forceUpdate]);

  useEffect(() => {
    localStorage.setItem("allMinutesFiles", JSON.stringify(documents));
  }, [documents]);

  const filteredDocs = documents.filter(doc => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
        String(doc.id).toLowerCase().includes(searchStr) ||
        (doc.hearingTitle && doc.hearingTitle.toLowerCase().includes(searchStr)) ||
        (doc.docketNo && doc.docketNo.toLowerCase().includes(searchStr));
    const currentStatus = doc.status?.toLowerCase() || "pending";
    const matchesFilter = filterStatus === "all" || currentStatus === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleSelectToggle = () => {
    const allVisibleSelected = filteredDocs.length > 0 && filteredDocs.every(d => d.selected);

    // Click 1: Turn on mode (Manual selection)
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    } 
    // Click 2: If everything is NOT selected, select all visible
    else if (!allVisibleSelected) {
      setDocuments(prev => prev.map(doc => {
        const isVisible = filteredDocs.some(v => v.id === doc.id);
        return isVisible ? { ...doc, selected: true } : doc;
      }));
    } 
    // Click 3: If everything IS selected, disable mode and unselect all
    else {
      setIsSelectionMode(false);
      setDocuments(prev => prev.map(doc => ({ ...doc, selected: false })));
    }
  };

  const handleCreateFromHearing = () => {
    if (!selectedHearingId) return;
    const linkedHearing = hearings.find(h => h.id.toString() === selectedHearingId.toString());
    const alreadyExists = documents.some(doc => doc.hearingTitle === linkedHearing.title);
    if (alreadyExists) {
      toast.warning(`Alert: A minute for "${linkedHearing.title}" already exists.`);
      return; 
    }
    const nextNumber = documents.length > 0 
      ? Math.max(...documents.map(d => {
          const num = parseInt(String(d.id).replace(/\D/g, ''));
          return isNaN(num) ? 0 : num;
        })) + 1 
      : 1;
    
    const newFile = {
      id: nextNumber,
      docketNo: "", 
      matter: linkedHearing.title,
      hearingTitle: linkedHearing.title,
      officer: linkedHearing.officer || "N/A",
      timestamp: new Date().toISOString(),
      status: "Pending", 
      selected: false,
      conferences: [] 
    };

    const updatedDocs = [newFile, ...documents];
    setDocuments(updatedDocs);
    setShowModal(false);
    setSelectedHearingId("");
    toast.success("Minute created!");
  };

  const handleDeleteSelected = () => {
    const selectedCount = documents.filter(d => d.selected).length;
    if (selectedCount === 0) return;
    const updatedDocs = documents.filter(doc => !doc.selected);
    setDocuments(updatedDocs);
    setIsSelectionMode(false);
    toast.info(`Deleted ${selectedCount} items.`);
  };

  const currentItems = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage));

  return (
    <div className="minutes-page">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-box">
              <FaCalendarCheck className="modal-upload-icon" />
              <span>Link Minute to Hearing</span>
            </div>
            <div className="modal-body">
              <select className="modal-select-dropdown" value={selectedHearingId} onChange={(e) => setSelectedHearingId(e.target.value)}>
                <option value="">-- Choose Hearing --</option>
                {hearings.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
              </select>
              <div className="modal-actions">
                <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="modal-btn-create" onClick={handleCreateFromHearing} disabled={!selectedHearingId}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="minutes-header">
        <h1>Minutes of Case Proceedings</h1>
        <p>View, manage, and track all client session minutes.</p>
      </header>

      <div className="horizontal-action-bar">
        <div className="search-box-wrapper">
          <FaSearch className="search-icon-fixed" />
          <input type="text" placeholder="Search by Docket # or Title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="filter-inline-container">
          <span className="filter-label-text">Filter By:</span>
          <select className="filter-select-box" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="all">All Status</option>
            <option value="Settled">Settled</option>
            <option value="Partial">Partial</option>
            <option value="Lack of Interest">Lack of Interest</option>
            <option value="Approval for Endorsement">Approval</option>
          </select>
        </div>

        <div className="button-actions-group">
          <button className="btn-add-fixed" onClick={() => setShowModal(true)}>ADD MINUTE</button>
          
          <button 
            className={`btn-select-fixed ${isSelectionMode ? "active-mode" : ""}`} 
            onClick={handleSelectToggle}
          >
            {!isSelectionMode ? "SELECT" : (filteredDocs.every(d => d.selected) && filteredDocs.length > 0 ? "UNSELECT ALL" : "SELECT ALL")}
          </button>

          <button className="btn-delete-fixed" onClick={handleDeleteSelected} disabled={!documents.some(d => d.selected)}>DELETE</button>
        </div>
      </div>

      <div className="grid-container-fixed">
        <div className="doc-grid-scroll-area">
          {currentItems.length > 0 ? (
            <div className="doc-grid">
              {currentItems.map((doc) => (
                <div 
                  key={doc.id} 
                  className={`document-card ${doc.selected ? "is-selected" : ""} ${String(doc.id) === String(highlightId) ? "glow-highlight" : ""}`} 
                  onClick={() => isSelectionMode ? setDocuments(prev => prev.map(d => d.id === doc.id ? {...d, selected: !d.selected} : d)) : navigate(`/minutes-info/${doc.id}`)}
                >
                  <div className="card-left">
                    <FaFileAlt className={`doc-icon ${doc.status?.replace(/\s+/g, '-').toLowerCase()}`} />
                    <div className="doc-details">
                      <span className="doc-id">{doc.docketNo || `Minute ${doc.id}`}</span>
                      <div className="doc-meta-info">
                        <span className="hearing-subtext">{doc.hearingTitle}</span>
                        <div className="meta-row">
                          <span><FaUserTie /> {doc.officer}</span>
                          <span className="time-stamp">{getRelativeTime(doc.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RESTORED: Options menu logic to keep icons used and functional */}
                  <div className="options-menu" onClick={(e) => e.stopPropagation()}>
                    <FaEllipsisV className="doc-options" />
                    <div className="dropdown-menu">
                      <button onClick={() => toast.info("Archive functionality requested.")}><FaArchive /> Archive</button>
                      <button className="delete-opt" onClick={() => {
                          const updated = documents.filter(d => d.id !== doc.id);
                          setDocuments(updated);
                          localStorage.setItem("allMinutesFiles", JSON.stringify(updated));
                          toast.info("Minute deleted.");
                      }}>
                          <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-container">
              <FaInbox className="empty-icon" />
              <h3>No Minutes Recorded</h3>
            </div>
          )}
        </div>
        
        <footer className="grid-footer">
          <div className="pagination-controls">
            <FaChevronLeft className={`arrow ${currentPage === 1 ? 'disabled' : ''}`} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
            {[...Array(totalPages)].map((_, i) => (
              <span key={i} className={`page-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</span>
            ))}
            <FaChevronRight className={`arrow ${currentPage === totalPages ? 'disabled' : ''}`} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Minutes;