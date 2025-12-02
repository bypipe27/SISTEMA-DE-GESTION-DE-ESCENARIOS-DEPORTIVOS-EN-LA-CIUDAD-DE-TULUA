// Toast.jsx - Componente de notificación
import React, { useEffect } from 'react';

const Toast = ({ isOpen, message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (isOpen && onClose) {
      // Aumentar duración para mensajes de error largos
      const adjustedDuration = type === 'error' && message.length > 80 ? duration + 2000 : duration;
      const timer = setTimeout(() => {
        onClose();
      }, adjustedDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration, type, message]);

  if (!isOpen) return null;

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-xl shadow-2xl transition-all duration-300 transform border-2";
    
    if (type === 'success') {
      return `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400`;
    } else if (type === 'error') {
      return `${baseStyles} bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400`;
    } else {
      return `${baseStyles} bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400`;
    }
  };

  const getIcon = () => {
    if (type === 'success') {
      return '✅';
    } else if (type === 'error') {
      return '⚠️';
    } else {
      return 'ℹ️';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-1">{getIcon()}</span>
        <div className="flex-grow">
          <p className="font-semibold text-sm leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-white hover:text-gray-200 font-bold text-xl leading-none ml-2 mt-1 hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
          title="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;