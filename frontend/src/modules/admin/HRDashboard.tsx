import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal } from '../../ui/components/common';
import {
  Users, Clock, CalendarDays, DollarSign, CheckCircle2, XCircle,
  ArrowRight, TrendingUp, UserPlus, AlertTriangle, ShieldCheck, Eye,
  Megaphone, Ticket, BarChart3, Target, LogIn, LogOut, MapPin, Building2, Home, UserCheck
} from 'lucide-react';
import type { User } from '../../types';

export const HRDashboard: React.FC = () => {
  const { users, attendance, leaveRequests, wfhRequests, payroll, announcements, tickets, compliance, currentUser,
    reviewLeave, reviewWFH, setActiveTab, setSelectedEmployee, checkIn, checkOut } = useApp();

  const [reviewModal, setReviewModal] = useState<{ item: any; type: 'leave' | 'wfh' } | null>(null);
  const [comments, setComments] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayAtt = attendance.filter(a => a.date === today);
  const presentToday = todayAtt.filter(a => ['Present', 'WFH'].includes(a.status)).length;
  const lateToday = todayAtt.filter(a => a.status === 'Late').length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');
  const pendingWFH = wfhRequests.filter(r => r.status === 'Pending');
  const totalMonthlyPayroll = payroll.filter(p => p.month === 'August 2026').reduce((s, p) => s + p.netPay, 0);
  const openTickets = tickets.filter(t => t.status === 'Open').length;

  const hrTodayRec = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === today);

  const handleConfirmReview = (status: 'Approved' | 'Rejected') => {
    if (!reviewModal) return;
    if (reviewModal.type === 'leave') reviewLeave(reviewModal.item.id, status, comments || `${status} by HR`);
    else reviewWFH(reviewModal.item.id, status, comments);
    setReviewModal(null); setComments('');
  };

  const handleHRCheckIn = () => {
    setActiveTab('attendance');
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="banner banner-dark" style={{ marginBottom: '1.75rem', background: 'linear-gradient(135deg, #714b67 0%, #00a09d 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="banner-tag"><ShieldCheck size={13} /> HR OFFICER MANAGEMENT HUB</div>
            <h2>Welcome, {currentUser.name.split(' ')[0]} 👋</h2>
            <p>Daily employee attendance monitoring, approval queue, payroll operations & onboarding.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* HR Personal Check-In / Check-Out Widget */}
            <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', padding: '.5rem .85rem', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: '.65rem', border: '1px solid rgba(255,255,255,0.3)' }}>
              <div>
                <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.85)', fontWeight: 700, textTransform: 'uppercase' }}>
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

            <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: '#fff' }} onClick={() => setActiveTab('employees')}>
              <UserPlus size={15} /> Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div><div className="stat-num">{users.length}</div><div className="stat-label">Total Workforce</div></div>
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
          <div><div className="stat-num">${totalMonthlyPayroll.toLocaleString()}</div><div className="stat-label">August Payroll</div></div>
          <div className="stat-icon purple"><DollarSign size={22} /></div>
        </div>
        <div className="stat-card red">
          <div><div className="stat-num">{openTickets}</div><div className="stat-label">Open Helpdesk Tickets</div></div>
          <div className="stat-icon red"><Ticket size={22} /></div>
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
            <div><h3 className="card-title"><CalendarDays size={18} color="var(--yellow)" /> HR Approval Queue</h3>
              <p className="card-subtitle">{pendingLeaves.length} leave + {pendingWFH.length} WFH pending</p></div>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('leaves')}>View All <ArrowRight size={13} /></button>
          </div>
          {[...pendingLeaves.slice(0, 3).map(r => ({ ...r, _type: 'leave' })), ...pendingWFH.slice(0, 2).map(r => ({ ...r, _type: 'wfh' }))].length === 0
            ? <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-3)' }}><CheckCircle2 size={28} color="var(--green)" style={{ margin: '0 auto .5rem' }} /><p>All requests processed!</p></div>
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
            <div><h3 className="card-title"><Clock size={18} color="var(--accent)" /> Today's Staff Attendance</h3>
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

      {/* Review Modal */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)} title="Review Employee Request"
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
