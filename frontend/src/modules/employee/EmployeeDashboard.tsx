import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass } from '../../ui/components/common';
import {
  Clock, Calendar, CheckCircle2, AlertCircle, FileText, ArrowRight, MapPin,
  LogIn, LogOut, Target, Megaphone, Ticket, Users, CalendarDays, ChevronLeft, ChevronRight, Home
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { currentUser, attendance, leaveRequests, wfhRequests, announcements, users, checkIn, checkOut, setActiveTab, markAnnouncementRead } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === today);
  const [timer, setTimer] = useState('00:00:00');
  const [location, setLocation] = useState('Main HQ');

  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (todayRecord?.checkIn && !todayRecord.checkOut) {
      interval = setInterval(() => {
        const [time, period] = todayRecord.checkIn!.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        const checkInTime = new Date(); checkInTime.setHours(h, m, 0, 0);
        const diff = Math.max(0, Math.floor((Date.now() - checkInTime.getTime()) / 1000));
        setTimer([Math.floor(diff / 3600), Math.floor((diff % 3600) / 60), diff % 60].map(n => String(n).padStart(2, '0')).join(':'));
      }, 1000);
    } else setTimer('00:00:00');
    return () => clearInterval(interval);
  }, [todayRecord]);

  // Calendar helpers
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const myAttendance = attendance.filter(a => a.employeeId === currentUser.employeeId);
  const myLeaves = leaveRequests.filter(r => r.employeeId === currentUser.employeeId);
  const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getCalDayClass = (day: number): string => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === today;
    const attRec = myAttendance.find(a => a.date === dateStr);
    const leaveRec = myLeaves.find(r => r.startDate <= dateStr && r.endDate >= dateStr && r.status === 'Approved');
    let cls = 'cal-day';
    if (isToday) cls += ' today';
    else if (leaveRec) cls += ' leave';
    else if (attRec?.status === 'Absent') cls += ' absent';
    else if (attRec) cls += ' has-event';
    return cls;
  };

  // Team presence
  const teamMembers = users.filter(u => u.departmentId === currentUser.departmentId && u.id !== currentUser.id);
  const teamPresent = teamMembers.filter(u => attendance.some(a => a.date === today && a.employeeId === u.employeeId && ['Present', 'WFH', 'Late'].includes(a.status)));

  const myPendingWFH = wfhRequests.filter(r => r.employeeId === currentUser.employeeId);
  const unreadAnn = announcements.filter(a => !a.readBy.includes(currentUser.employeeId));
  const myGoals = currentUser.goals || [];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="banner banner-purple" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="banner-tag"><span style={{ fontSize: '.85rem' }}>👋</span> EMPLOYEE SELF-SERVICE PORTAL</div>
            <h2>{greeting}, {currentUser.name.split(' ')[0]}!</h2>
            <p>{currentUser.designation} · {currentUser.departmentName}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, opacity: .9 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <div style={{ fontSize: '.82rem', opacity: .75, marginTop: '.15rem' }}>Employee ID: {currentUser.employeeId}</div>
          </div>
        </div>
      </div>

      {/* Leave Balance Quick Widgets */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card"><div><div className="stat-num">{currentUser.leaveBalances.paid}</div><div className="stat-label">Paid Leave Days</div></div><div className="stat-icon"><Calendar size={20} /></div></div>
        <div className="stat-card teal"><div><div className="stat-num">{currentUser.leaveBalances.sick}</div><div className="stat-label">Sick Leave Days</div></div><div className="stat-icon teal"><Calendar size={20} /></div></div>
        <div className="stat-card yellow"><div><div className="stat-num">{currentUser.leaveBalances.casual}</div><div className="stat-label">Casual Leave Days</div></div><div className="stat-icon yellow"><Calendar size={20} /></div></div>
        <div className="stat-card purple"><div><div className="stat-num">${currentUser.salary.netSalary.toLocaleString()}</div><div className="stat-label">Monthly Net Pay</div></div><div className="stat-icon purple"><FileText size={20} /></div></div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>

        {/* Check In/Out Widget */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Clock size={18} color="var(--accent)" /> Today's Check-In</h3>
            <span style={{ fontSize: '.8rem', color: 'var(--text-3)', fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="card-flat" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            {todayRecord?.checkIn && !todayRecord.checkOut ? (
              <>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace', letterSpacing: 2 }}>{timer}</div>
                <p style={{ fontSize: '.82rem', color: 'var(--text-3)', marginTop: '.35rem' }}>Checked in at <strong>{todayRecord.checkIn}</strong> · {todayRecord.location}</p>
                <button className="btn btn-danger btn-full" style={{ marginTop: '1rem' }} onClick={checkOut}><LogOut size={15} /> Check Out Now</button>
              </>
            ) : todayRecord?.checkOut ? (
              <>
                <CheckCircle2 size={42} color="var(--green)" style={{ margin: '0 auto .5rem' }} />
                <h4 style={{ fontWeight: 700 }}>Day Complete!</h4>
                <p style={{ fontSize: '.83rem', color: 'var(--text-3)' }}>In: {todayRecord.checkIn} · Out: {todayRecord.checkOut}</p>
              </>
            ) : todayRecord?.status === 'Leave' ? (
              <>
                <CalendarDays size={42} color="var(--purple)" style={{ margin: '0 auto .5rem' }} />
                <h4 style={{ fontWeight: 700, color: 'var(--purple)' }}>On Approved Leave</h4>
              </>
            ) : (
              <>
                <AlertCircle size={36} color="var(--text-4)" style={{ margin: '0 auto .75rem' }} />
                <p style={{ fontSize: '.83rem', color: 'var(--text-3)', marginBottom: '1rem' }}>Not checked in for today.</p>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Location</label>
                  <div className="input-icon-wrap">
                    <MapPin size={15} className="input-icon" />
                    <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-primary btn-full" onClick={() => checkIn(location)}><LogIn size={15} /> Check In Now</button>
              </>
            )}
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><CalendarDays size={18} color="var(--primary)" /> My Attendance Calendar</h3>
          </div>
          <div className="mini-cal">
            <div className="cal-header">
              <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}><ChevronLeft size={16} /></button>
              <span>{monthName}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}><ChevronRight size={16} /></button>
            </div>
            <div className="cal-grid">
              {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="cal-day-header">{d}</div>)}
              {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={day} className={getCalDayClass(day)}>{day}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '.85rem', flexWrap: 'wrap', fontSize: '.73rem', fontWeight: 600, color: 'var(--text-3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />Present</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', display: 'inline-block' }} />Leave</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />Absent</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div className="quick-grid">
            <button className="quick-card" onClick={() => setActiveTab('leaves')}>
              <div className="quick-icon"><Calendar size={20} /></div><div className="quick-label">Apply Leave</div>
            </button>
            <button className="quick-card" onClick={() => setActiveTab('leaves')}>
              <div className="quick-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}><Home size={20} /></div><div className="quick-label">Request WFH</div>
            </button>
            <button className="quick-card" onClick={() => setActiveTab('payroll')}>
              <div className="quick-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}><FileText size={20} /></div><div className="quick-label">View Payslip</div>
            </button>
            <button className="quick-card" onClick={() => setActiveTab('tickets')}>
              <div className="quick-icon" style={{ background: 'var(--yellow-bg)', color: 'var(--yellow)' }}><Ticket size={20} /></div><div className="quick-label">Raise Ticket</div>
            </button>
            <button className="quick-card" onClick={() => setActiveTab('team')}>
              <div className="quick-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}><Users size={20} /></div><div className="quick-label">Team Directory</div>
            </button>
            <button className="quick-card" onClick={() => setActiveTab('goals')}>
              <div className="quick-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}><Target size={20} /></div><div className="quick-label">My Goals</div>
            </button>
          </div>
        </div>

        {/* Team Presence */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Users size={18} color="var(--green)" /> Team Presence Today</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('team')}>Directory <ArrowRight size={13} /></button>
          </div>
          {teamMembers.length === 0
            ? <p style={{ color: 'var(--text-3)', fontSize: '.85rem' }}>No other team members in your department.</p>
            : teamMembers.map(u => {
              const isPresent = attendance.some(a => a.date === today && a.employeeId === u.employeeId && ['Present', 'WFH', 'Late'].includes(a.status));
              const rec = attendance.find(a => a.date === today && a.employeeId === u.employeeId);
              return (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.55rem .75rem', borderRadius: 'var(--r-md)', marginBottom: '.4rem', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={u.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                    <div className={`presence-dot ${isPresent ? 'online' : 'offline'}`} style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid var(--surface-2)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.83rem' }}>{u.name}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{u.designation}</div>
                  </div>
                  <span className={getBadgeClass(rec?.status || 'Absent')} style={{ fontSize: '.7rem' }}>{rec?.status || 'Absent'}</span>
                </div>
              );
            })
          }
        </div>

        {/* Announcements Feed */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Megaphone size={18} color="var(--purple)" /> Company Announcements</h3>
            {unreadAnn.length > 0 && <span className="badge badge-pending">{unreadAnn.length} unread</span>}
          </div>
          {announcements.slice(0, 3).map(a => (
            <div key={a.id} className={`ann-card ${!a.readBy.includes(currentUser.employeeId) ? 'unread' : ''}`} onClick={() => markAnnouncementRead(a.id)}>
              <div className={`ann-priority ${a.priority}`} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '.87rem' }}>{a.title}</strong>
                  <span className={getBadgeClass(a.priority)} style={{ fontSize: '.68rem' }}>{a.priority}</span>
                </div>
                <p style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: '.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.content}</p>
                <p style={{ fontSize: '.7rem', color: 'var(--text-4)', marginTop: '.25rem' }}>By {a.postedBy} · {a.postedOn}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My Goals */}
        {myGoals.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Target size={18} color="var(--accent)" /> My Goals — {myGoals[0]?.quarter}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('goals')}>All Goals <ArrowRight size={13} /></button>
            </div>
            {myGoals.map(g => (
              <div key={g.id} className="goal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.87rem' }}>{g.title}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: '.1rem' }}>{g.description}</div>
                  </div>
                  <span className={getBadgeClass(g.status)} style={{ fontSize: '.7rem', whiteSpace: 'nowrap' }}>{g.status}</span>
                </div>
                <div className="goal-status-bar">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.73rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: '.25rem' }}>
                    <span>Progress</span><span>{g.progress}%</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className={`progress-bar ${g.status === 'At Risk' ? 'red' : g.status === 'Completed' ? 'green' : 'primary'}`} style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
