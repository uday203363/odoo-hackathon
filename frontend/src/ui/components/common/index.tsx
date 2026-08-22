import React, { useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && <CheckCircle2 size={16} color="#10b981" />}
          {t.type === 'error' && <AlertCircle size={16} color="#ef4444" />}
          {t.type === 'warning' && <AlertTriangle size={16} color="#f59e0b" />}
          {t.type === 'info' && <Info size={16} color="#3b82f6" />}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{ color: 'rgba(255,255,255,.6)', padding: '0 2px' }}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box ${size}`} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

interface EmptyStateProps { icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode; }
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, action }) => (
  <div className="empty-state">
    <div className="icon">{icon}</div>
    <h4>{title}</h4>
    {subtitle && <p>{subtitle}</p>}
    {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
  </div>
);

export const getBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    Present: 'badge-present', Late: 'badge-late', 'Half-day': 'badge-halfday',
    Absent: 'badge-absent', Leave: 'badge-leave', WFH: 'badge-wfh',
    Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected', Cancelled: 'badge-cancelled',
    Open: 'badge-open', 'In Progress': 'badge-inprogress', Resolved: 'badge-resolved', Closed: 'badge-closed',
    Info: 'badge-info', Important: 'badge-important', Urgent: 'badge-urgent',
    Active: 'badge-active', Probation: 'badge-probation', 'Notice Period': 'badge-notice', Inactive: 'badge-inactive',
    Paid: 'badge-approved', Processing: 'badge-pending',
    Overdue: 'badge-rejected', Done: 'badge-approved',
  };
  return `badge ${map[status] || 'badge-pending'}`;
};
