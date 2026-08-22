import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
          {t.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
          {t.type === 'info' && <Info size={18} color="var(--accent)" />}
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{ color: 'white', marginLeft: '0.5rem', opacity: 0.8 }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
