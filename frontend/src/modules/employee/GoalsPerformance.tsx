import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, EmptyState, Modal } from '../../ui/components/common';
import { Target, Plus, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { Goal } from '../../types';

export const GoalsPerformance: React.FC = () => {
  const { users, currentUser, updateGoalProgress, addGoal } = useApp();
  const isAdmin = currentUser.role === 'admin';

  const [selectedEmpId, setSelectedEmpId] = useState<string>(isAdmin ? users[1]?.employeeId : currentUser.employeeId);
  const [addModal, setAddModal] = useState(false);
  const [progressModal, setProgressModal] = useState<Goal | null>(null);
  const [newProgress, setNewProgress] = useState(0);
  const [newGStatus, setNewGStatus] = useState<Goal['status']>('In Progress');
  const [form, setForm] = useState({ title: '', description: '', quarter: 'Q3 2026', dueDate: '', employeeId: isAdmin ? (users[1]?.employeeId || '') : currentUser.employeeId });

  const empUser = users.find(u => u.employeeId === selectedEmpId) || users[0];
  const goals = empUser?.goals || [];

  const handleAddGoal = () => {
    addGoal({ ...form, status: 'Not Started', progress: 0, setBy: currentUser.name });
    setAddModal(false); setForm({ title: '', description: '', quarter: 'Q3 2026', dueDate: '', employeeId: form.employeeId });
  };

  const handleUpdateProgress = () => {
    if (progressModal) { updateGoalProgress(progressModal.employeeId, progressModal.id, newProgress, newGStatus); setProgressModal(null); }
  };

  const goalColor = (status: Goal['status']) => {
    if (status === 'Completed') return 'var(--green)';
    if (status === 'At Risk') return 'var(--red)';
    if (status === 'In Progress') return 'var(--primary)';
    return 'var(--text-4)';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Goals & Performance</h1><p>{isAdmin ? 'Set and track quarterly goals for each employee.' : 'View and update your assigned goals.'}</p></div>
          {isAdmin && <button className="btn btn-primary" onClick={() => setAddModal(true)}><Plus size={16} /> Assign Goal</button>}
        </div>
      </div>

      {isAdmin && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="card-title" style={{ marginBottom: '.85rem' }}>Select Employee</h3>
          <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
            {users.map(u => (
              <button key={u.id} className={`btn ${selectedEmpId === u.employeeId ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedEmpId(u.employeeId)}>
                <img src={u.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                {u.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card"><div><div className="stat-num">{goals.length}</div><div className="stat-label">Total Goals</div></div><div className="stat-icon"><Target size={20} /></div></div>
        <div className="stat-card green"><div><div className="stat-num">{goals.filter(g => g.status === 'Completed').length}</div><div className="stat-label">Completed</div></div><div className="stat-icon green"><CheckCircle2 size={20} /></div></div>
        <div className="stat-card"><div><div className="stat-num">{goals.filter(g => g.status === 'In Progress').length}</div><div className="stat-label">In Progress</div></div><div className="stat-icon teal"><TrendingUp size={20} /></div></div>
        <div className="stat-card red"><div><div className="stat-num">{goals.filter(g => g.status === 'At Risk').length}</div><div className="stat-label">At Risk</div></div></div>
      </div>

      {goals.length === 0
        ? <EmptyState icon={<Target size={40} />} title="No Goals Set" subtitle={isAdmin ? 'Assign goals to this employee.' : 'Your manager has not assigned goals yet.'} action={isAdmin ? <button className="btn btn-primary" onClick={() => setAddModal(true)}><Plus size={15} /> Assign Goal</button> : undefined} />
        : goals.map(g => (
          <div key={g.id} className="card" style={{ marginBottom: '.85rem', borderLeft: `3px solid ${goalColor(g.status)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.25rem' }}>
                  <strong style={{ fontSize: '.95rem' }}>{g.title}</strong>
                  <span className={getBadgeClass(g.status)}>{g.status}</span>
                  <span style={{ fontSize: '.73rem', color: 'var(--text-4)', background: 'var(--surface-2)', padding: '.1rem .5rem', borderRadius: 99 }}>{g.quarter}</span>
                </div>
                <p style={{ fontSize: '.83rem', color: 'var(--text-3)', marginBottom: '.75rem' }}>{g.description}</p>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: '.3rem' }}>
                    <span>Progress</span><span style={{ color: goalColor(g.status) }}>{g.progress}%</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar primary" style={{ width: `${g.progress}%`, background: goalColor(g.status) }} />
                  </div>
                </div>
                <div style={{ fontSize: '.73rem', color: 'var(--text-4)', marginTop: '.5rem' }}>Set by {g.setBy} · Due: {g.dueDate} · Updated: {g.updatedOn}</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => { setProgressModal(g); setNewProgress(g.progress); setNewGStatus(g.status); }}>
                Update Progress
              </button>
            </div>
          </div>
        ))
      }

      {/* Add Goal Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Assign New Goal" size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setAddModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddGoal}><Plus size={15} /> Assign Goal</button></>}>
        {isAdmin && (
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select className="form-control" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
              {users.map(u => <option key={u.id} value={u.employeeId}>{u.name}</option>)}
            </select>
          </div>
        )}
        <div className="form-group"><label className="form-label">Goal Title *</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Quarter</label><input className="form-control" value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-control" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
        </div>
      </Modal>

      {/* Update Progress Modal */}
      <Modal open={!!progressModal} onClose={() => setProgressModal(null)} title="Update Goal Progress" size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setProgressModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdateProgress}>Save</button></>}>
        {progressModal && (
          <>
            <p style={{ fontWeight: 700, marginBottom: '1rem' }}>{progressModal.title}</p>
            <div className="form-group">
              <label className="form-label">Progress: <strong style={{ color: 'var(--primary)' }}>{newProgress}%</strong></label>
              <input type="range" min={0} max={100} value={newProgress} onChange={e => setNewProgress(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={newGStatus} onChange={e => setNewGStatus(e.target.value as Goal['status'])}>
                <option>Not Started</option><option>In Progress</option><option>Completed</option><option>At Risk</option>
              </select>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
