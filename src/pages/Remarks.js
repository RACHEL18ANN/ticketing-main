import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Editor,
    EditorProvider,
    Toolbar,
    BtnBold,
    BtnItalic,
    BtnUnderline,
    BtnStrikeThrough,
    BtnNumberedList,
    BtnBulletList,
    BtnLink,
    Separator
} from 'react-simple-wysiwyg';
import '../styles/Remarks.css';

const Remarks = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    // 1. LOAD DATA: This runs as soon as the page opens
    useEffect(() => {
        const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
        // Find the specific hearing by ID
        const currentHearing = savedHearings.find(h => h.id.toString() === id.toString());
        
        if (currentHearing) {
            // If the hearing already has a saved title or content, put it in the editor
            if (currentHearing.remarkTitle) setTitle(currentHearing.remarkTitle);
            if (currentHearing.remarkContent) setContent(currentHearing.remarkContent);
        }
    }, [id]);

    // 2. SAVE DATA: Updates the record in localStorage
    const handleSave = () => {
        if (!title.trim()) {
            setNotification({
                show: true,
                message: "Action Denied: Please provide a title for these remarks.",
                type: "error"
            });
            return;
        }

        const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
        
        // Map through the hearings and update only the one matching the current ID
        const updatedHearings = savedHearings.map(h => {
            if (h.id.toString() === id.toString()) {
                return { 
                    ...h, 
                    status: 'Done', // Automatically mark as Done upon saving remarks
                    remarkTitle: title, 
                    remarkContent: content 
                };
            }
            return h;
        });
        
        // Save the whole updated array back to localStorage
        localStorage.setItem('hearings', JSON.stringify(updatedHearings));

        setNotification({
            show: true,
            message: "Remark saved successfully! Data is now persistent.",
            type: "success"
        });

        // Redirect back to main schedule after a short delay
        setTimeout(() => {
            navigate('/schedule');
        }, 2000);
    };

    const handleCancel = () => {
        navigate('/schedule');
    };

    // Auto-hide notification
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    return (
        <div className="remarks-container">
            {notification.show && (
                <div className={`notification-toast ${notification.type}`}>
                    <span className="icon">
                        {notification.type === 'success' ? '✓' : '✕'}
                    </span>
                    {notification.message}
                </div>
            )}

            <div className="remarks-header">
                <h1>Hearing Remarks</h1>
                <div className="remarks-actions">
                    <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Submit Remark</button>
                </div>
            </div>

            <div className="editor-paper">
                <input
                    type="text"
                    className="remark-title-input"
                    placeholder="Remark Title (e.g., Case #12345 Hearing)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <EditorProvider>
                    <Editor
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        containerProps={{
                            style: {
                                height: '700px',
                                border: 'none',
                                fontFamily: '"Times New Roman", Times, serif',
                                fontSize: '14pt'
                            }
                        }}
                    >
                        <Toolbar>
                            <BtnBold />
                            <BtnItalic />
                            <BtnUnderline />
                            <BtnStrikeThrough />
                            <Separator />
                            <BtnNumberedList />
                            <BtnBulletList />
                            <Separator />
                            <BtnLink />
                        </Toolbar>
                    </Editor>
                </EditorProvider>
            </div>
        </div>
    );
};

export default Remarks;