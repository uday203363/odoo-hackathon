import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal } from '../../ui/components/common';
import {
  Users, Clock, CalendarDays, DollarSign, CheckCircle2, XCircle,
  ArrowRight, TrendingUp, UserPlus, AlertTriangle, ShieldCheck, Eye,
  Megaphone, Ticket, BarChart3, Target
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, attendance, leaveRequests, wfhRequests, payroll, announcements, tickets, compliance,
    reviewLeave, reviewWFH, setActiveTab, setSelectedEmployee } = useApp();

  const [reviewModal, setReviewModal] = useState<{ item: any; type: 'leave' | 'wfh' } | null>(null);
  const [comments, setComments] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayAtt = attendance.filter(a => a.date === today);
  const presentToday = todayAtt.filter(a => ['Present', 'WFH'].includes(a.status)).length;
  const lateToday = todayAtt.filter(a => a.status === 'Late').length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');
  const pendingWFH = wfhRequests.filter(r => r.status === 'Pending');
  const totalMonthlyPayroll = payroll.filter(p => p.month === 'August 2026').reduce((s, p) => s + p.netPay, 0);
  const overdueCompliance = compliance.filter(c => c.status === 'Overdue').length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;

  const handleConfirmReview = (status: 'Approved' | 'Rejected') => {
    if (!reviewModal) return;
    if (reviewModal.type === 'leave') reviewLeave(reviewModal.item.id, status, comments || `${status} by HR`);
    else reviewWFH(reviewModal.item.id, status, comments);
    setReviewModal(null); setComments('');
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="banner banner-dark" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="banner-tag"><ShieldCheck size={13} /> HR EXECUTIVE COMMAND CENTER</div>
            <h2>Welcome, {useApp().currentUser.name.split(' ')[0]} 👋</h2>
            <p>Real-time workforce metrics, pending approvals, and compliance status at a glance.</p>
          </div>
          <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
            <button className="btn btn-accent" onClick={() => setActiveTab('employees')}><UserPlus size={15} /> Add Employee</button>
            <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} onClick={() => setActiveTab('analytics')}>
              <BarChart3 size={15} /> Analytics
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div><div className="stat-num">{users.length}</div><div className="stat-label">Total Employees</div></div>
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
                  <div style={{ fontWeight: 700, fontSize: '.82rem' }}>{u.name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{u.designation}</div>
                </div>
                <span className={getBadgeClass(status)} style={{ fontSize: '.7rem' }}>{status}</span>
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', minWidth: 55 }}>{rec?.checkIn || '—'}</div>
              </div>
            );
          })}
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Megaphone size={18} color="var(--purple)" /> Announcements</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('announcements')}>Manage <ArrowRight size={13} /></button>
          </div>
          {announcements.slice(0, 3).map(a => (
            <div key={a.id} className="ann-card">
              <div className={`ann-priority ${a.priority}`} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '.87rem' }}>{a.title}</strong>
                  <span className={getBadgeClass(a.priority)} style={{ fontSize: '.68rem' }}>{a.priority}</span>
                </div>
                <p style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: '.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.content}</p>
                <p style={{ fontSize: '.7rem', color: 'var(--text-4)', marginTop: '.3rem' }}>{a.postedOn} · {a.readBy.length} read</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Alerts + Open Tickets */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><AlertTriangle size={18} color="var(--red)" /> Compliance Alerts & Tickets</h3>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('compliance')}>Compliance</button>
              <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('tickets')}>Tickets</button>
            </div>
          </div>
          {compliance.filter(c => c.status !== 'Done').slice(0, 3).map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.65rem .85rem', background: c.status === 'Overdue' ? 'var(--red-bg)' : 'var(--yellow-bg)', borderRadius: 'var(--r-md)', marginBottom: '.5rem', border: `1px solid ${c.status === 'Overdue' ? '#fecaca' : '#fef08a'}` }}>
              <AlertTriangle size={16} color={c.status === 'Overdue' ? 'var(--red)' : 'var(--yellow)'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '.82rem' }}>{c.employeeName} — {c.type}</div>
                <div style={{ fontSize: '.73rem', color: 'var(--text-3)' }}>Due: {c.dueDate}</div>
              </div>
              <span className={getBadgeClass(c.status)}>{c.status}</span>
            </div>
          ))}
          <div style={{ marginTop: '.75rem', borderTop: '1px solid var(--border)', paddingTop: '.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: '.5rem' }}>
              <span><Ticket size={14} style={{ marginRight: 6 }} />Open Tickets ({openTickets})</span>
            </div>
            {tickets.filter(t => t.status === 'Open').slice(0, 2).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.55rem .75rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', marginBottom: '.4rem' }}>
                <img src={t.employeeAvatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1, fontSize: '.8rem' }}><strong>{t.subject}</strong> <span style={{ color: 'var(--text-3)' }}>— {t.employeeName}</span></div>
                <span className={getBadgeClass(t.priority)} style={{ fontSize: '.68rem' }}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workforce Table */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Users size={18} color="var(--primary)" /> Workforce Overview</h3>
          <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('employees')}>Manage All <ArrowRight size={13} /></button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Employee</th><th>Department</th><th>Status</th><th>Today</th><th>Paid Leave Left</th><th>Goals</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => {
                const todayS = todayAtt.find(a => a.employeeId === u.employeeId)?.status || 'Absent';
                const goalsCount = (u.goals || []).length;
                const completedGoals = (u.goals || []).filter(g => g.status === 'Completed').length;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="emp-cell">
                        <img src={u.avatar} alt="" className="emp-avatar" />
                        <div><div className="emp-name">{u.name}</div><div className="emp-sub">{u.employeeId}</div></div>
                      </div>
                    </td>
                    <td>{u.departmentName}</td>
                    <td><span className={getBadgeClass(u.employmentStatus)}>{u.employmentStatus}</span></td>
                    <td><span className={getBadgeClass(todayS)} style={{ fontSize: '.72rem' }}>{todayS}</span></td>
                    <td><strong>{u.leaveBalances.paid}</strong> days</td>
                    <td>{goalsCount > 0 ? <span style={{ fontSize: '.8rem' }}>{completedGoals}/{goalsCount} done</span> : <span style={{ color: 'var(--text-4)', fontSize: '.8rem' }}>None</span>}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => { setSelectedEmployee(u); setActiveTab('employees'); }}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
