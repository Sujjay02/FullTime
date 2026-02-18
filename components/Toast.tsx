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

  const config = {
    success: { icon: <CheckCircle2 size={18} className="text-emerald-400" />, border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    error: { icon: <XCircle size={18} className="text-red-400" />, border: 'border-red-500/30', bg: 'bg-red-500/10' },
    info: { icon: <Info size={18} className="text-blue-400" />, border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  };
  const { icon, border, bg } = config[type];

  return (
    <div className="fixed bottom-5 right-5 z-[100] max-w-sm animate-slide-up">
      <div className={`${bg} ${border} border rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md flex items-center gap-3`}>
        {icon}
        <p className="flex-1 text-sm text-zinc-200">{message}</p>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition shrink-0"><X size={14} /></button>
      </div>
    </div>
  );
};

export default Toast;
