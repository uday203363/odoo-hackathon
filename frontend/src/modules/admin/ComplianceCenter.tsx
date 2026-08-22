import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle, Edit3 } from 'lucide-react';
import type { ComplianceItem } from '../../types';

export const ComplianceCenter: React.FC = () => {
  const { compliance, updateCompliance } = useApp();
  const [modal, setModal] = useState<ComplianceItem | null>(null);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState<ComplianceItem['status']>('Pending');

  const overdue = compliance.filter(c => c.status === 'Overdue');
  const pending = compliance.filter(c => c.status === 'Pending');
  const done = compliance.filter(c => c.status === 'Done');

  const handleSave = () => {
    if (modal) { updateCompliance(modal.id, newStatus, notes); setModal(null); }
  };

  const typeIcon = (type: string) => {
    if (type === 'Contract Renewal') return <ShieldCheck size={16} color="var(--primary)" />;
    if (type === 'Probation End') return <Clock size={16} color="var(--yellow)" />;
    return <CheckCircle2 size={16} color="var(--accent)" />;
  };

  const ComplianceRow: React.FC<{ item: ComplianceItem }> = ({ item }) => (
    <div className="compliance-item">
      <div className={`compliance-icon`} style={{ background: item.status === 'Overdue' ? 'var(--red-bg)' : item.status === 'Done' ? 'var(--green-bg)' : 'var(--yellow-bg)' }}>{typeIcon(item.type)}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '.87rem' }}>{item.employeeName}</div>
        <div style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>{item.type} · Due: {item.dueDate}</div>
        {item.notes && <div style={{ fontSize: '.73rem', color: 'var(--text-4)', marginTop: '.2rem' }}>{item.notes}</div>}
      </div>
      <span className={getBadgeClass(item.status)}>{item.status}</span>
      <button className="btn btn-outline btn-sm" onClick={() => { setModal(item); setNotes(item.notes || ''); setNewStatus(item.status); }}><Edit3 size={13} /> Update</button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>HR Compliance Center</h1>
        <p>Track contract renewals, probation periods, and policy acknowledgements.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card red"><div><div className="stat-num">{overdue.length}</div><div className="stat-label">Overdue Items</div></div><div className="stat-icon red"><AlertTriangle size={22} /></div></div>
        <div className="stat-card yellow"><div><div className="stat-num">{pending.length}</div><div className="stat-label">Pending Items</div></div><div className="stat-icon yellow"><Clock size={22} /></div></div>
        <div className="stat-card green"><div><div className="stat-num">{done.length}</div><div className="stat-label">Completed</div></div><div className="stat-icon green"><CheckCircle2 size={22} /></div></div>
      </div>

      {overdue.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem', borderTop: '3px solid var(--red)' }}>
          <h3 className="card-title" style={{ color: 'var(--red)', marginBottom: '1rem' }}><AlertTriangle size={17} /> Overdue Items</h3>
          {overdue.map(c => <ComplianceRow key={c.id} item={c} />)}
        </div>
      )}

      {pending.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem', borderTop: '3px solid var(--yellow)' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}><Clock size={17} /> Pending Items</h3>
          {pending.map(c => <ComplianceRow key={c.id} item={c} />)}
        </div>
      )}

      {done.length > 0 && (
        <div className="card" style={{ borderTop: '3px solid var(--green)' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}><CheckCircle2 size={17} /> Completed</h3>
          {done.map(c => <ComplianceRow key={c.id} item={c} />)}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title="Update Compliance Item" size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save Changes</button></>}>
        {modal && (
          <>
            <div className="card-flat" style={{ marginBottom: '1rem' }}>
              <p><strong>Employee:</strong> {modal.employeeName}</p>
              <p><strong>Type:</strong> {modal.type}</p>
              <p><strong>Due Date:</strong> {modal.dueDate}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value as ComplianceItem['status'])}>
                <option>Pending</option><option>Done</option><option>Overdue</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={3} value={notes} onChange={e => setNotes(e.target.value)} /></div>
          </>
        )}
      </Modal>
    </div>
  );
};
