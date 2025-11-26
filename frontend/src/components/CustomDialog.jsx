import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * Componente de diálogo personalizado moderno y colorido
 */
export const CustomDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
          icon: <FaCheckCircle className="text-4xl text-white" />,
          confirmBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
          cancelBg: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
        };
      case 'warning':
        return {
          gradient: 'from-amber-500 via-orange-600 to-red-600',
          icon: <FaExclamationTriangle className="text-4xl text-white" />,
          confirmBg: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
          cancelBg: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
        };
      case 'info':
        return {
          gradient: 'from-blue-500 via-indigo-600 to-purple-600',
          icon: <FaInfoCircle className="text-4xl text-white" />,
          confirmBg: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
          cancelBg: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
        };
      default:
        return {
          gradient: 'from-blue-500 via-indigo-600 to-purple-600',
          icon: <FaExclamationTriangle className="text-4xl text-white" />,
          confirmBg: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
          cancelBg: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scaleIn">
        {/* Header con gradiente */}
        <div className={`bg-gradient-to-r ${styles.gradient} px-6 py-8 relative overflow-hidden`}>
          {/* Decoraciones de fondo */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-full">
              {styles.icon}
            </div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">
              {title}
            </h3>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6 bg-gradient-to-b from-slate-50 to-white">
          <p className="text-slate-700 text-center text-base leading-relaxed mb-6">
            {message}
          </p>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-5 py-3 ${styles.cancelBg} text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-5 py-3 ${styles.confirmBg} text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de notificación (Toast) moderna y colorida
 */
export const CustomToast = ({ isOpen, onClose, message, type = 'success', duration = 3000 }) => {
  React.useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          icon: <FaCheckCircle className="text-2xl text-white" />
        };
      case 'error':
        return {
          gradient: 'from-red-500 to-rose-600',
          icon: <FaExclamationTriangle className="text-2xl text-white" />
        };
      case 'warning':
        return {
          gradient: 'from-amber-500 to-orange-600',
          icon: <FaExclamationTriangle className="text-2xl text-white" />
        };
      case 'info':
        return {
          gradient: 'from-blue-500 to-indigo-600',
          icon: <FaInfoCircle className="text-2xl text-white" />
        };
      default:
        return {
          gradient: 'from-emerald-500 to-teal-600',
          icon: <FaCheckCircle className="text-2xl text-white" />
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div className={`bg-gradient-to-r ${styles.gradient} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-md border-2 border-white/30`}>
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <p className="flex-1 font-semibold text-sm">
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <FaTimes className="text-white" />
        </button>
      </div>
    </div>
  );
};

// Estilos de animación (agregar al index.css)
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.3s ease-out;
}

.animate-slideInRight {
  animation: slideInRight 0.3s ease-out;
}
`;
