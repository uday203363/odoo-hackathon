import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal } from '../../ui/components/common';
import {
  Users, Clock, CalendarDays, DollarSign, CheckCircle2, XCircle,
  ArrowRight, TrendingUp, UserPlus, AlertTriangle, ShieldCheck, Eye,
  Megaphone, Ticket, BarChart3, Target, LogIn, LogOut, MapPin, Building2, Home, UserCheck, ShieldAlert, Edit3
} from 'lucide-react';
import type { User } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { users, attendance, leaveRequests, wfhRequests, payroll, announcements, tickets, compliance, currentUser,
    reviewLeave, reviewWFH, setActiveTab, setSelectedEmployee, checkIn, checkOut, companyLocation, hasApprovedWFHToday, updateProfile } = useApp();

  const [reviewModal, setReviewModal] = useState<{ item: any; type: 'leave' | 'wfh' } | null>(null);
  const [comments, setComments] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'employee'>('all');
  const [roleToggleConfirm, setRoleToggleConfirm] = useState<User | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayAtt = attendance.filter(a => a.date === today);
  const presentToday = todayAtt.filter(a => ['Present', 'WFH'].includes(a.status)).length;
  const lateToday = todayAtt.filter(a => a.status === 'Late').length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');
  const pendingWFH = wfhRequests.filter(r => r.status === 'Pending');
  const totalMonthlyPayroll = payroll.filter(p => p.month === 'August 2026').reduce((s, p) => s + p.netPay, 0);
  const overdueCompliance = compliance.filter(c => c.status === 'Overdue').length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;

  const hrTodayRec = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === today);

  const filteredWorkforce = users.filter(u => {
    if (roleFilter === 'admin') return u.role === 'admin';
    if (roleFilter === 'employee') return u.role === 'employee';
    return true;
  });

  const hrCount = users.filter(u => u.role === 'admin').length;
  const empCount = users.filter(u => u.role === 'employee').length;

  const handleConfirmReview = (status: 'Approved' | 'Rejected') => {
    if (!reviewModal) return;
    if (reviewModal.type === 'leave') reviewLeave(reviewModal.item.id, status, comments || `${status} by HR`);
    else reviewWFH(reviewModal.item.id, status, comments);
    setReviewModal(null); setComments('');
  };

  const handleToggleRole = () => {
    if (roleToggleConfirm) {
      const newRole = roleToggleConfirm.role === 'admin' ? 'employee' : 'admin';
      updateProfile(roleToggleConfirm.id, { role: newRole });
      setRoleToggleConfirm(null);
    }
  };

  const handleHRCheckIn = () => {
    setActiveTab('attendance');
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="banner banner-dark" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="banner-tag"><ShieldCheck size={13} /> HR EXECUTIVE COMMAND CENTER</div>
            <h2>Welcome, {currentUser.name.split(' ')[0]} 👋</h2>
            <p>Real-time workforce metrics, pending approvals, and compliance status at a glance.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* HR Personal Check-In / Check-Out Widget */}
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '.5rem .85rem', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: '.65rem', border: '1px solid rgba(255,255,255,0.25)' }}>
              <div>
                <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase' }}>
                  HR Today's Shift
                </div>
                <div style={{ fontSize: '.83rem', fontWeight: 800, color: '#fff' }}>
                  {hrTodayRec?.checkIn ? `Checked In (${hrTodayRec.checkIn})` : 'Not Checked In'}
                </div>
              </div>

              {!hrTodayRec?.checkIn && (
                <button className="btn btn-accent btn-sm" onClick={handleHRCheckIn}>
                  <LogIn size={14} /> Check In HR
                </button>
              )}
              {hrTodayRec?.checkIn && !hrTodayRec.checkOut && (
                <button className="btn btn-danger btn-sm" onClick={checkOut}>
                  <LogOut size={14} /> Check Out HR
                </button>
              )}
            </div>

            <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} onClick={() => setActiveTab('employees')}><UserPlus size={15} /> Add Employee</button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div><div className="stat-num">{users.length}</div><div className="stat-label">Total Staff ({hrCount} HR / {empCount} Emp)</div></div>
          <div className="stat-icon"><Users size={22} /></div>
        </div>
        <div className="stat-card teal">
          <div><div className="stat-num">{presentToday}/{users.length}</div><div className="stat-label">Present Today</div></div>
          <div className="stat-icon teal"><Clock size={22} /></div>
        </div>
        <div className="stat-card yellow">
          <div><div className="stat-num">{pendingLeaves.length + pendingWFH.length}</div><div className="stat-label">Pending Approvals</div></div>
          <div className="stat-icon yellow"><CalendarDays size={22} /></div>
        </div>
        <div className="stat-card purple">
          <div><div className="stat-num">${totalMonthlyPayroll.toLocaleString()}</div><div className="stat-label">Monthly Payroll</div></div>
          <div className="stat-icon purple"><DollarSign size={22} /></div>
        </div>
        <div className="stat-card red">
          <div><div className="stat-num">{overdueCompliance}</div><div className="stat-label">Compliance Alerts</div></div>
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-num">{lateToday}</div><div className="stat-label">Late Today</div></div>
          <div className="stat-icon"><TrendingUp size={22} /></div>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.25rem' }}>

        {/* Pending Approvals */}
        <div className="card">
          <div className="card-header">
            <div><h3 className="card-title"><CalendarDays size={18} color="var(--yellow)" /> Approval Queue</h3>
              <p className="card-subtitle">{pendingLeaves.length} leave + {pendingWFH.length} WFH pending</p></div>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('leaves')}>View All <ArrowRight size={13} /></button>
          </div>
          {[...pendingLeaves.slice(0, 3).map(r => ({ ...r, _type: 'leave' })), ...pendingWFH.slice(0, 2).map(r => ({ ...r, _type: 'wfh' }))].length === 0
            ? <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-3)' }}><CheckCircle2 size={28} color="var(--green)" style={{ margin: '0 auto .5rem' }} /><p>All caught up!</p></div>
            : [...pendingLeaves.slice(0, 3).map(r => ({ ...r, _type: 'leave' })), ...pendingWFH.slice(0, 2).map(r => ({ ...r, _type: 'wfh' }))].map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.75rem', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', marginBottom: '.6rem', border: '1px solid var(--border)' }}>
                <img src={item.employeeAvatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.87rem' }}>{item.employeeName}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>
                    {item._type === 'leave' ? `${(item as any).leaveType} Leave · ${(item as any).daysCount} days · ${(item as any).startDate}` : `WFH Request · ${(item as any).date}`}
                  </div>
                </div>
                <span className={getBadgeClass(item._type === 'leave' ? 'Pending' : 'Pending')}>Pending</span>
                <button className="btn btn-primary btn-sm" onClick={() => { setReviewModal({ item, type: item._type as any }); setComments(''); }}>Review</button>
              </div>
            ))
          }
        </div>

        {/* Today's Attendance Live */}
        <div className="card">
          <div className="card-header">
            <div><h3 className="card-title"><Clock size={18} color="var(--accent)" /> Today's Attendance</h3>
              <p className="card-subtitle">{today}</p></div>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('attendance')}>Full Log <ArrowRight size={13} /></button>
          </div>
          {users.map(u => {
            const rec = todayAtt.find(a => a.employeeId === u.employeeId);
            const status = rec?.status || 'Absent';
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem', padding: '.6rem .75rem', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <img src={u.avatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.82rem' }}>
                    {u.name} {u.id === currentUser.id && <span style={{ fontSize: '.68rem', color: 'var(--primary)', fontWeight: 800 }}>(You - HR)</span>}
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{u.designation}</div>
                </div>
                <span className={getBadgeClass(status)} style={{ fontSize: '.7rem' }}>{status}</span>
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', minWidth: 55 }}>{rec?.checkIn || '—'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin HR & Employee Role Management Table */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '.5rem' }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={18} color="var(--primary)" /> HR & Employee Role Control Panel
            </h3>
            <p className="card-subtitle">Maintain roles, permissions, and status for HR Officers and Employees.</p>
          </div>
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <button className={`btn btn-sm ${roleFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('all')}>
              All ({users.length})
            </button>
            <button className={`btn btn-sm ${roleFilter === 'admin' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('admin')}>
              HR Admins ({hrCount})
            </button>
            <button className={`btn btn-sm ${roleFilter === 'employee' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('employee')}>
              Employees ({empCount})
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee / HR</th>
                <th>Role</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions & Role Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkforce.map(u => {
                const isHR = u.role === 'admin';
                const isSelf = u.id === currentUser.id;
                return (
                  <tr key={u.id} style={isSelf ? { background: 'var(--primary-light)' } : undefined}>
                    <td>
                      <div className="emp-cell">
                        <img src={u.avatar} alt="" className="emp-avatar" />
                        <div>
                          <div className="emp-name">
                            {u.name} {isSelf && <span style={{ fontSize: '.7rem', color: 'var(--primary)', fontWeight: 800 }}>(You)</span>}
                          </div>
                          <div className="emp-sub">{u.employeeId} · {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isHR ? 'badge-urgent' : 'badge-active'}`} style={{ fontSize: '.72rem' }}>
                        {isHR ? '🛡️ HR Officer / Admin' : '👤 Employee'}
                      </span>
                    </td>
                    <td>{u.departmentName}</td>
                    <td>{u.designation}</td>
                    <td><span className={getBadgeClass(u.employmentStatus)}>{u.employmentStatus}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => { setSelectedEmployee(u); setActiveTab('employees'); }}>
                          <Eye size={13} /> Profile
                        </button>
                        {!isSelf && (
                          <button
                            className={`btn btn-sm ${isHR ? 'btn-outline' : 'btn-accent'}`}
                            onClick={() => setRoleToggleConfirm(u)}
                            style={{ fontSize: '.73rem' }}
                          >
                            {isHR ? 'Demote to Employee' : 'Promote to HR Admin'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Toggle Confirm Modal */}
      <Modal open={!!roleToggleConfirm} onClose={() => setRoleToggleConfirm(null)} title="Change Role & Permissions" size="sm"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setRoleToggleConfirm(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleToggleRole}>Confirm Role Change</button>
          </>
        }
      >
        {roleToggleConfirm && (
          <div>
            <p style={{ fontSize: '.88rem', color: 'var(--text-2)' }}>
              Are you sure you want to change <strong>{roleToggleConfirm.name}</strong>'s role from{' '}
              <strong>{roleToggleConfirm.role === 'admin' ? 'HR Officer / Admin' : 'Employee'}</strong> to{' '}
              <strong style={{ color: 'var(--primary)' }}>{roleToggleConfirm.role === 'admin' ? 'Employee' : 'HR Officer / Admin'}</strong>?
            </p>
            <p style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: '.5rem' }}>
              {roleToggleConfirm.role === 'employee'
                ? 'Promoting to HR Admin will grant full system access, approval authority, and workforce management tools.'
                : 'Demoting to Employee will restrict access to standard Employee Self-Service.'}
            </p>
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)} title="Review Request"
        footer={
          <>
            <button className="btn btn-danger" onClick={() => handleConfirmReview('Rejected')}><XCircle size={15} /> Reject</button>
            <button className="btn btn-success" onClick={() => handleConfirmReview('Approved')}><CheckCircle2 size={15} /> Approve</button>
          </>
        }
      >
        {reviewModal && (
          <div>
            <div className="card-flat" style={{ marginBottom: '1rem' }}>
              <p><strong>Employee:</strong> {reviewModal.item.employeeName}</p>
              {reviewModal.type === 'leave'
                ? <><p><strong>Type:</strong> {reviewModal.item.leaveType} Leave</p><p><strong>Dates:</strong> {reviewModal.item.startDate} → {reviewModal.item.endDate} ({reviewModal.item.daysCount} days)</p><p><strong>Reason:</strong> {reviewModal.item.reason}</p></>
                : <><p><strong>WFH Date:</strong> {reviewModal.item.date}</p><p><strong>Reason:</strong> {reviewModal.item.reason}</p></>
              }
            </div>
            <div className="form-group">
              <label className="form-label">HR Comments</label>
              <textarea className="form-control" rows={3} placeholder="Optional notes for employee..." value={comments} onChange={e => setComments(e.target.value)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
