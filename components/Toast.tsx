import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {t.type === 'success' && <CheckCircle size={14} color="var(--accent)" />}
          {t.type === 'error' && <AlertCircle size={14} color="var(--red)" />}
          {t.type === 'info' && <Info size={14} color="var(--text-secondary)" />}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
