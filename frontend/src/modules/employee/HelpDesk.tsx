import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Plus, Ticket, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import type { TicketCategory, HelpTicket } from '../../types';

export const HelpDesk: React.FC = () => {
  const { tickets, currentUser, createTicket, respondTicket } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [newModal, setNewModal] = useState(false);
  const [respondModal, setRespondModal] = useState<HelpTicket | null>(null);
  const [response, setResponse] = useState('');
  const [respStatus, setRespStatus] = useState<HelpTicket['status']>('In Progress');
  const [form, setForm] = useState({ category: 'IT Request' as TicketCategory, subject: '', description: '', priority: 'Medium' as HelpTicket['priority'] });

  const myTickets = isAdmin ? tickets : tickets.filter(t => t.employeeId === currentUser.employeeId);
  const [filter, setFilter] = useState<string>('All');
  const filtered = filter === 'All' ? myTickets : myTickets.filter(t => t.status === filter);

  const handleCreate = () => {
    createTicket({ ...form, employeeId: currentUser.employeeId, employeeName: currentUser.name, employeeAvatar: currentUser.avatar, department: currentUser.departmentName });
    setNewModal(false); setForm({ category: 'IT Request', subject: '', description: '', priority: 'Medium' });
  };

  const handleRespond = () => {
    if (respondModal) { respondTicket(respondModal.id, response, respStatus); setRespondModal(null); setResponse(''); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Help Desk</h1><p>{isAdmin ? 'Manage employee support tickets.' : 'Raise queries and track your HR tickets.'}</p></div>
          {!isAdmin && <button className="btn btn-primary" onClick={() => setNewModal(true)}><Plus size={16} /> Raise Ticket</button>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tab-bar">
        {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
          <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon={<Ticket size={40} />} title="No Tickets" subtitle="No tickets match this filter." action={!isAdmin ? <button className="btn btn-primary" onClick={() => setNewModal(true)}><Plus size={15} /> Raise a Ticket</button> : undefined} />
        : filtered.map(t => (
          <div key={t.id} className="card" style={{ marginBottom: '.85rem' }}>
            <div style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start' }}>
              <img src={t.employeeAvatar} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap', marginBottom: '.25rem' }}>
                  <strong style={{ fontSize: '.95rem' }}>{t.subject}</strong>
                  <span className={getBadgeClass(t.status)}>{t.status}</span>
                  <span className={getBadgeClass(t.priority)}>{t.priority}</span>
                  <span style={{ fontSize: '.73rem', color: 'var(--text-4)', background: 'var(--surface-2)', padding: '.1rem .5rem', borderRadius: 'var(--r-full)' }}>{t.category}</span>
                </div>
                <p style={{ fontSize: '.78rem', color: 'var(--text-3)', marginBottom: '.35rem' }}>{isAdmin ? `${t.employeeName} · ${t.department}` : `Ticket #${t.id}`} · {t.createdOn}</p>
                <p style={{ fontSize: '.83rem', color: 'var(--text-2)', marginBottom: '.5rem' }}>{t.description}</p>
                {t.adminResponse && (
                  <div style={{ background: 'var(--green-bg)', border: '1px solid #d1fae5', borderRadius: 'var(--r-md)', padding: '.65rem .85rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '.75rem', color: 'var(--green)', marginBottom: '.2rem' }}><CheckCircle2 size={12} style={{ marginRight: 4 }} />HR Response from {t.respondedBy}:</div>
                    <p style={{ fontSize: '.83rem' }}>{t.adminResponse}</p>
                  </div>
                )}
              </div>
              {isAdmin && t.status !== 'Resolved' && t.status !== 'Closed' && (
                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => { setRespondModal(t); setResponse(t.adminResponse || ''); setRespStatus('Resolved'); }}>
                  <MessageSquare size={13} /> Respond
                </button>
              )}
            </div>
          </div>
        ))
      }

      {/* New Ticket Modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="Raise a Support Ticket"
        footer={<><button className="btn btn-outline" onClick={() => setNewModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}><Ticket size={15} /> Submit Ticket</button></>}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as TicketCategory })}>
              {['IT Request', 'Salary Query', 'Policy Clarification', 'Leave Issue', 'Payroll Error', 'Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as HelpTicket['priority'] })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Subject *</label><input className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description *</label><textarea className="form-control" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      </Modal>

      {/* Respond Modal */}
      <Modal open={!!respondModal} onClose={() => setRespondModal(null)} title={`Respond: ${respondModal?.subject}`} size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setRespondModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleRespond}>Send Response</button></>}>
        {respondModal && (
          <>
            <div className="card-flat" style={{ marginBottom: '1rem' }}>
              <p><strong>From:</strong> {respondModal.employeeName}</p>
              <p style={{ marginTop: '.35rem', fontSize: '.83rem', color: 'var(--text-2)' }}>{respondModal.description}</p>
            </div>
            <div className="form-group"><label className="form-label">Your Response *</label><textarea className="form-control" rows={4} value={response} onChange={e => setResponse(e.target.value)} /></div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={respStatus} onChange={e => setRespStatus(e.target.value as HelpTicket['status'])}>
                <option>In Progress</option><option>Resolved</option><option>Closed</option>
              </select>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
