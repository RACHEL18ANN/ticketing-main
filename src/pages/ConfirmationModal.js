import React from 'react';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(3, 10, 73, 0.3);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(4px);
          }

          .modal-container {
            background: white;
            padding: 2.5rem;
            border-radius: 20px;
            width: 90%;
            max-width: 420px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
            text-align: center;
            animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.9) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }

          .modal-container h3 {
            margin: 0 0 10px;
            color: #030a49;
            font-size: 1.4rem;
            font-weight: 800;
          }

          .modal-container p {
            color: #64748b;
            margin-bottom: 2rem;
            font-size: 1rem;
            line-height: 1.5;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
          }

          .modal-btn {
            padding: 12px 28px;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
          }

          .modal-btn.cancel {
            background: #f1f5f9;
            color: #64748b;
          }

          .modal-btn.cancel:hover {
            background: #e2e8f0;
          }

          .modal-btn.confirm {
            background: #030a49;
            color: white;
          }

          .modal-btn.confirm:hover {
            background: #02083a;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(3, 10, 73, 0.2);
          }
        `}
      </style>

      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <h3>Confirmation</h3>
          <p>{message}</p>
          <div className="modal-actions">
            <button className="modal-btn cancel" onClick={onCancel}>Cancel</button>
            <button className="modal-btn confirm" onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;