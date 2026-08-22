import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Plus, Search, Edit3, Trash2, Building2, Users, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import type { Department } from '../../types';

export const DepartmentManager: React.FC = () => {
  const { departments, users, addDepartment, updateDepartment, deleteDepartment, setSelectedEmployee, setActiveTab } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', description: '', headId: '', headName: '', color: '#714b67' });

  const handleOpen = (dept?: Department) => {
    if (dept) {
      setEditDept(dept);
      setForm({ name: dept.name, description: dept.description, headId: dept.headId, headName: dept.headName, color: dept.color });
    } else {
      setEditDept(null);
      setForm({ name: '', description: '', headId: '', headName: '', color: '#714b67' });
    }
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
          <div>
            <h1>Departments & Org Structure</h1>
            <p>Manage company departments, reporting hierarchy, and team headcount.</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpen()}>
            <Plus size={16} /> New Department
          </button>
        </div>
      </div>

      {/* Org Chart visual */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'auto' }}>
        <h3 className="card-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Building2 size={18} color="var(--primary)" /> Organizational Hierarchy Chart
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          {/* Root: CEO */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', color: '#fff', border: '2px solid #714b67', borderRadius: 12, padding: '12px 28px', textAlign: 'center', minWidth: 180, boxShadow: 'var(--shadow-md)' }}>
            <div style={{ fontWeight: 800, fontSize: '.92rem' }}>CEO & Executive Office</div>
            <div style={{ fontSize: '.72rem', opacity: .8, marginTop: 2 }}>Executive Leadership Board</div>
          </div>

          <div style={{ width: 2, height: 20, background: 'var(--border-strong)' }} />

          {/* HR Node */}
          <div style={{ border: '2px solid var(--primary)', background: 'var(--primary-light)', borderRadius: 10, padding: '10px 24px', textAlign: 'center', minWidth: 170 }}>
            <div style={{ fontWeight: 800, fontSize: '.86rem', color: 'var(--primary)' }}>People & Culture</div>
            <div style={{ fontSize: '.73rem', color: 'var(--text-3)', marginTop: 2 }}>Elena Rostova · Head of HR</div>
          </div>

          <div style={{ width: 2, height: 20, background: 'var(--border-strong)' }} />

          {/* Dept row */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {departments.filter(d => d.id !== 'dept-1').map(dept => {
              const deptUsers = users.filter(u => u.departmentId === dept.id);
              return (
                <div
                  key={dept.id}
                  style={{
                    border: `2px solid ${dept.color}`,
                    borderRadius: 10,
                    padding: '10px 18px',
                    textAlign: 'center',
                    minWidth: 140,
                    background: `${dept.color}15`,
                    cursor: 'pointer',
                    transition: 'transform .18s ease'
                  }}
                  onClick={() => handleOpen(dept)}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: dept.color, margin: '0 auto .35rem' }} />
                  <div style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-1)' }}>{dept.name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{dept.headName}</div>
                  <div style={{ marginTop: '.35rem', fontSize: '.7rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, padding: '2px 8px', display: 'inline-block', fontWeight: 700 }}>
                    {deptUsers.length} staff
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {departments.map(dept => {
          const deptMembers = users.filter(u => u.departmentId === dept.id);
          const headUser = users.find(u => u.employeeId === dept.headId || u.name.toLowerCase() === dept.headName.toLowerCase());

          return (
            <div key={dept.id} className="dept-card" style={{ borderTop: `4px solid ${dept.color}` }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.65rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-1)' }}>{dept.name}</h3>
                    <p style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: '.15rem', lineHeight: 1.4 }}>
                      {dept.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '.35rem', flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleOpen(dept)} title="Edit Department">
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      style={{ color: 'var(--red)' }}
                      onClick={() => { if (confirm(`Delete ${dept.name} department?`)) deleteDepartment(dept.id); }}
                      title="Delete Department"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Department Head Chip */}
                <div className="dept-head-box">
                  <img
                    src={headUser?.avatar || `https://images.unsplash.com/photo-1535713875002?w=150&auto=format&fit=crop&q=80`}
                    alt={dept.headName}
                    className="dept-head-avatar"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                      Department Lead
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dept.headName}
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>
                      {headUser?.designation || 'Lead Director'}
                    </div>
                  </div>
                </div>

                {/* Team Members List */}
                <div style={{ marginTop: '.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                    <span style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.3px' }}>
                      Team Members ({deptMembers.length})
                    </span>
                    <span style={{ fontSize: '.72rem', color: 'var(--text-4)' }}>
                      {deptMembers.length === 1 ? '1 employee' : `${deptMembers.length} employees`}
                    </span>
                  </div>

                  {deptMembers.length === 0 ? (
                    <p style={{ fontSize: '.78rem', color: 'var(--text-4)', fontStyle: 'italic', padding: '.4rem 0' }}>No members assigned yet.</p>
                  ) : (
                    <div className="avatar-group">
                      {deptMembers.slice(0, 6).map(member => (
                        <img
                          key={member.id}
                          src={member.avatar}
                          alt={member.name}
                          title={`${member.name} (${member.designation})`}
                          onClick={() => { setSelectedEmployee(member); setActiveTab('employees'); }}
                        />
                      ))}
                      {deptMembers.length > 6 && (
                        <div className="avatar-group-more">
                          +{deptMembers.length - 6}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div style={{ marginTop: '1.25rem', paddingTop: '.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.74rem', color: 'var(--text-3)' }}>
                  Active Roster: <strong>{deptMembers.length}</strong>
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '.75rem', color: 'var(--primary)', padding: '2px 6px' }}
                  onClick={() => { setActiveTab('team'); }}
                >
                  View Team <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editDept ? 'Edit Department' : 'Create New Department'}
        size="sm"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Department</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Department Name</label>
          <input className="form-control" placeholder="e.g. Product Design" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={2} placeholder="Brief department scope..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Department Head (Employee)</label>
          <select className="form-control" value={form.headId} onChange={e => setForm({ ...form, headId: e.target.value })}>
            <option value="">Select department lead...</option>
            {users.map(u => (
              <option key={u.id} value={u.employeeId}>{u.name} ({u.employeeId} - {u.designation})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Brand Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
            <input type="color" className="form-control" style={{ width: 60, height: 40, padding: 2, cursor: 'pointer' }} value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            <input type="text" className="form-control" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="#714b67" />
          </div>
        </div>
      </Modal>
    </div>
  );
};
