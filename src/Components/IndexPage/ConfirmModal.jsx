// src/Components/ConfirmModal/ConfirmModal.jsx
import React from 'react';
import '../styles/ConfirmModal.css'

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
    // Nie renderuj modala, jeśli isOpen jest false
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="modal-button confirm" onClick={onConfirm}>Tak</button>
                    <button className="modal-button cancel" onClick={onCancel}>Nie</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;