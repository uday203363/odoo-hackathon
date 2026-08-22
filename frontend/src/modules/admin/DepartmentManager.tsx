import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Plus, Search, Edit3, Trash2, Building2, Users, AlertTriangle } from 'lucide-react';
import type { Department } from '../../types';

export const DepartmentManager: React.FC = () => {
  const { departments, users, addDepartment, updateDepartment, deleteDepartment } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', description: '', headId: '', headName: '', color: '#714b67' });

  const handleOpen = (dept?: Department) => {
    if (dept) { setEditDept(dept); setForm({ name: dept.name, description: dept.description, headId: dept.headId, headName: dept.headName, color: dept.color }); }
    else { setEditDept(null); setForm({ name: '', description: '', headId: '', headName: '', color: '#714b67' }); }
    setShowModal(true);
  };

  const handleSave = () => {
    const headUser = users.find(u => u.employeeId === form.headId);
    const data = { ...form, headName: headUser?.name || form.headName };
    if (editDept) updateDepartment(editDept.id, data);
    else addDepartment(data);
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Departments & Org Structure</h1><p>Manage company departments and reporting hierarchy.</p></div>
          <button className="btn btn-primary" onClick={() => handleOpen()}><Plus size={16} /> New Department</button>
        </div>
      </div>

      {/* Org Chart visual */}
      <div className="card" style={{ marginBottom: '1.25rem', overflow: 'auto' }}>
        <h3 className="card-title" style={{ marginBottom: '1.25rem' }}><Building2 size={18} /> Organizational Chart</h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          {/* Root: CEO */}
          <div style={{ background: '#12101a', color: '#fff', border: '2px solid #714b67', borderRadius: 12, padding: '12px 24px', textAlign: 'center', minWidth: 160 }}>
            <div style={{ fontWeight: 800, fontSize: '.9rem' }}>CEO Office</div>
            <div style={{ fontSize: '.73rem', opacity: .7, marginTop: 2 }}>Executive Board</div>
          </div>
          <div style={{ width: 2, height: 24, background: 'var(--border-strong)' }} />
          {/* HR Node */}
          <div style={{ border: '2px solid var(--primary)', background: 'var(--primary-light)', borderRadius: 10, padding: '10px 20px', textAlign: 'center', minWidth: 150 }}>
            <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--primary)' }}>People & Culture</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Elena Rostova · Head of HR</div>
          </div>
          <div style={{ width: 2, height: 24, background: 'var(--border-strong)' }} />
          {/* Dept row */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {departments.filter(d => d.id !== 'dept-1').map(dept => {
              const deptUsers = users.filter(u => u.departmentId === dept.id);
              return (
                <div key={dept.id} style={{ border: `2px solid ${dept.color}`, borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 130, background: `${dept.color}12`, cursor: 'pointer' }}
                  onClick={() => handleOpen(dept)}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: dept.color, margin: '0 auto .3rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '.83rem' }}>{dept.name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{dept.headName}</div>
                  <div style={{ marginTop: '.3rem', fontSize: '.7rem', background: 'rgba(255,255,255,.5)', borderRadius: 99, padding: '1px 6px', display: 'inline-block', fontWeight: 700 }}>{deptUsers.length} members</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {departments.map(dept => {
          const deptMembers = users.filter(u => u.departmentId === dept.id);
          return (
            <div key={dept.id} className="card" style={{ borderTop: `3px solid ${dept.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>{dept.name}</h3>
                  <p style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: '.1rem' }}>{dept.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '.35rem' }}>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleOpen(dept)}><Edit3 size={14} /></button>
                  <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--red)' }} onClick={() => { if (confirm('Delete this department?')) deleteDepartment(dept.id); }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.65rem' }}>
                <Users size={14} color="var(--text-3)" />
                <span style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>{deptMembers.length} employees · Head: <strong>{dept.headName}</strong></span>
              </div>
              <div className="avatar-group">
                {deptMembers.slice(0, 5).map(u => <img key={u.id} src={u.avatar} alt={u.name} title={u.name} />)}
                {deptMembers.length > 5 && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>+{deptMembers.length - 5}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editDept ? 'Edit Department' : 'New Department'} size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save Department</button></>}>
        <div className="form-group"><label className="form-label">Department Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-group">
          <label className="form-label">Department Head (Employee)</label>
          <select className="form-control" value={form.headId} onChange={e => setForm({ ...form, headId: e.target.value })}>
            <option value="">Select head...</option>
            {users.map(u => <option key={u.id} value={u.employeeId}>{u.name} ({u.employeeId})</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Color</label><input type="color" className="form-control" style={{ height: 42 }} value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
      </Modal>
    </div>
  );
};
