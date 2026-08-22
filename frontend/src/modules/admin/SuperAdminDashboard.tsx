import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal } from '../../ui/components/common';
import {
  ShieldCheck, ShieldAlert, Users, Building2, DollarSign, AlertTriangle,
  BarChart3, CheckCircle2, UserCheck, Key, Settings, TrendingUp, Activity, Lock, Eye, Edit3
} from 'lucide-react';
import type { User } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const { users, departments, payroll, compliance, attendance, currentUser, setActiveTab, setSelectedEmployee, updateProfile } = useApp();

  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'employee'>('all');
  const [roleToggleConfirm, setRoleToggleConfirm] = useState<User | null>(null);

  const hrOfficers = users.filter(u => u.role === 'admin' || u.role === 'super_admin' || u.role === 'hr');
  const employees = users.filter(u => u.role === 'employee');

  const totalMonthlyPayroll = payroll.filter(p => p.month === 'August 2026').reduce((s, p) => s + p.netPay, 0);
  const overdueCompliance = compliance.filter(c => c.status === 'Overdue').length;

  const today = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(a => a.date === today && ['Present', 'WFH'].includes(a.status)).length;

  const handleToggleRole = () => {
    if (roleToggleConfirm) {
      const newRole = roleToggleConfirm.role === 'employee' ? 'admin' : 'employee';
      updateProfile(roleToggleConfirm.id, { role: newRole });
      setRoleToggleConfirm(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter === 'admin') return u.role === 'admin' || u.role === 'super_admin' || u.role === 'hr';
    if (roleFilter === 'employee') return u.role === 'employee';
    return true;
  });

  return (
    <div>
      {/* Super Admin Top Banner */}
      <div className="banner banner-dark" style={{ marginBottom: '1.75rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="banner-tag" style={{ background: 'rgba(238, 242, 255, 0.2)', color: '#a5b4fc' }}>
              <ShieldAlert size={14} /> SUPER ADMIN EXECUTIVE CONTROL CENTER
            </div>
            <h2>Global System Command Center 👋</h2>
            <p>Master organization controls, HR officer delegation, compliance risk center & company financials.</p>
          </div>
          <div style={{ display: 'flex', gap: '.65rem' }}>
            <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} onClick={() => setActiveTab('analytics')}>
              <BarChart3 size={15} /> Company Analytics
            </button>
            <button className="btn btn-primary" style={{ background: '#6366f1', borderColor: '#4f46e5' }} onClick={() => setActiveTab('employees')}>
              <Users size={15} /> Workforce Directory ({users.length})
            </button>
          </div>
        </div>
      </div>

      {/* High-level KPI Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div><div className="stat-num">{users.length}</div><div className="stat-label">Total Organization Staff</div></div>
          <div className="stat-icon"><Users size={22} /></div>
        </div>
        <div className="stat-card purple">
          <div><div className="stat-num">{hrOfficers.length}</div><div className="stat-label">HR & Admin Officers</div></div>
          <div className="stat-icon purple"><ShieldCheck size={22} /></div>
        </div>
        <div className="stat-card teal">
          <div><div className="stat-num">{departments.length}</div><div className="stat-label">Active Departments</div></div>
          <div className="stat-icon teal"><Building2 size={22} /></div>
        </div>
        <div className="stat-card green">
          <div><div className="stat-num">${totalMonthlyPayroll.toLocaleString()}</div><div className="stat-label">Monthly Payroll Budget</div></div>
          <div className="stat-icon green"><DollarSign size={22} /></div>
        </div>
        <div className="stat-card red">
          <div><div className="stat-num">{overdueCompliance}</div><div className="stat-label">Critical Compliance Alerts</div></div>
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

        {/* Full Team Roster Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={18} color="var(--primary)" /> Complete Organization Roster ({users.length})
            </h3>
            <span className="badge badge-active">{users.length} Active Staff Members</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.75rem', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <img src={u.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {u.name}
                    {u.role === 'super_admin' && <span className="badge badge-urgent" style={{ fontSize: '.65rem', background: '#4f46e5', color: '#fff' }}>Super Admin</span>}
                    {u.role === 'admin' && <span className="badge badge-pending" style={{ fontSize: '.65rem' }}>Head of HR</span>}
                    {u.role === 'employee' && <span className="badge badge-active" style={{ fontSize: '.65rem' }}>Employee</span>}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{u.designation} · {u.email}</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => { setSelectedEmployee(u); setActiveTab('employees'); }}>
                  <Eye size={13} /> View Profile
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Department Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={18} color="var(--accent)" /> Department Breakdown
            </h3>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('departments')}>Manage</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {departments.map(dept => {
              const count = users.filter(u => u.departmentId === dept.id).length;
              return (
                <div key={dept.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.65rem .85rem', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: dept.color }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{dept.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Head: {dept.headName}</div>
                    </div>
                  </div>
                  <span className="badge badge-neutral" style={{ fontWeight: 700 }}>{count} members</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Role Administration Panel */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '.5rem' }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Key size={18} color="var(--primary)" /> Master Role & Access Matrix ({filteredUsers.length} Visible)
            </h3>
            <p className="card-subtitle">Showing all members of the organization including Super Admin, HR Officers, and Employees.</p>
          </div>
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <button className={`btn btn-sm ${roleFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('all')}>
              All Members ({users.length})
            </button>
            <button className={`btn btn-sm ${roleFilter === 'admin' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('admin')}>
              HR & Admins ({hrOfficers.length})
            </button>
            <button className={`btn btn-sm ${roleFilter === 'employee' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('employee')}>
              Employees ({employees.length})
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name & ID</th>
                <th>System Access Role</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Role Controls</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const isHR = u.role === 'admin' || u.role === 'super_admin' || u.role === 'hr';
                const isSelf = u.id === currentUser.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="emp-cell">
                        <img src={u.avatar} alt="" className="emp-avatar" />
                        <div>
                          <div className="emp-name">
                            {u.name} {isSelf && <span style={{ fontSize: '.7rem', color: 'var(--primary)', fontWeight: 800 }}>(Super Admin)</span>}
                          </div>
                          <div className="emp-sub">{u.employeeId} · {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'super_admin' ? 'badge-urgent' : u.role === 'admin' ? 'badge-pending' : 'badge-active'}`}>
                        {u.role === 'super_admin' ? '👑 Super Admin' : u.role === 'admin' ? '🛡️ Head of HR' : '👤 Employee'}
                      </span>
                    </td>
                    <td>{u.departmentName}</td>
                    <td>{u.designation}</td>
                    <td><span className={getBadgeClass(u.employmentStatus)}>{u.employmentStatus}</span></td>
                    <td>
                      {!isSelf ? (
                        <button
                          className={`btn btn-sm ${isHR ? 'btn-outline' : 'btn-accent'}`}
                          onClick={() => setRoleToggleConfirm(u)}
                          style={{ fontSize: '.73rem' }}
                        >
                          {isHR ? 'Demote to Employee' : 'Promote to HR Admin'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '.75rem', color: 'var(--text-4)', fontWeight: 600 }}>Master Account</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Toggle Confirm Modal */}
      <Modal open={!!roleToggleConfirm} onClose={() => setRoleToggleConfirm(null)} title="Modify System Role & Authority" size="sm"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setRoleToggleConfirm(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleToggleRole}>Confirm Role Update</button>
          </>
        }
      >
        {roleToggleConfirm && (
          <div>
            <p style={{ fontSize: '.88rem', color: 'var(--text-2)' }}>
              Are you sure you want to change <strong>{roleToggleConfirm.name}</strong>'s role from{' '}
              <strong>{(roleToggleConfirm.role === 'admin' || roleToggleConfirm.role === 'super_admin' || roleToggleConfirm.role === 'hr') ? 'HR Officer / Admin' : 'Employee'}</strong> to{' '}
              <strong style={{ color: 'var(--primary)' }}>{(roleToggleConfirm.role === 'admin' || roleToggleConfirm.role === 'super_admin' || roleToggleConfirm.role === 'hr') ? 'Employee' : 'HR Officer / Admin'}</strong>?
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
