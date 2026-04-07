import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Added useParams
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
    const { id } = useParams(); // Get hearing ID from URL
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    const handleSave = () => {
        if (!title.trim()) {
            setNotification({
                show: true,
                message: "Action Denied: Please provide a title for these remarks.",
                type: "error"
            });
            return;
        }

        // --- UPDATE LOGIC FOR REPORTS ---
        const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
        const updatedHearings = savedHearings.map(h => {
            // Find the hearing by ID and mark it as 'Done'
            if (h.id.toString() === id.toString()) {
                return { ...h, status: 'Done', remarkTitle: title, remarkContent: content };
            }
            return h;
        });
        
        localStorage.setItem('hearings', JSON.stringify(updatedHearings));
        // --------------------------------

        setNotification({
            show: true,
            message: "Remark saved successfully! Hearing marked as Done.",
            type: "success"
        });

        // Redirect back to schedule after success
        setTimeout(() => navigate('/schedule'), 2000);
    };

    const handleCancel = () => {
        navigate('/schedule');
    };

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
                                fontFamily: '"Times New Roman", Times, serif'
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