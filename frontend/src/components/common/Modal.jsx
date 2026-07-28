import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '520px' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div 
        className="modal-box"
        style={{ maxWidth, width: '100%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="modal-close"
            title="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
