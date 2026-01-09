
import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 size={20} className="text-green-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />
  };

  const bgColors = {
    success: 'bg-green-900/20 border-green-500/50',
    error: 'bg-red-900/20 border-red-500/50',
    info: 'bg-blue-900/20 border-blue-500/50'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300`}>
      <div className={`${bgColors[type]} border rounded-lg p-4 shadow-2xl backdrop-blur-sm flex items-start gap-3`}>
        {icons[type]}
        <p className="flex-1 text-sm text-white">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
