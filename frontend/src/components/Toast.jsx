// Toast.jsx - Componente de notificación
import React, { useEffect } from 'react';

const Toast = ({ isOpen, message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform";
    
    if (type === 'success') {
      return `${baseStyles} bg-green-500 text-white`;
    } else if (type === 'error') {
      return `${baseStyles} bg-red-500 text-white`;
    } else {
      return `${baseStyles} bg-blue-500 text-white`;
    }
  };

  const getIcon = () => {
    if (type === 'success') {
      return '✅';
    } else if (type === 'error') {
      return '❌';
    } else {
      return 'ℹ️';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{getIcon()}</span>
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 font-bold text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;