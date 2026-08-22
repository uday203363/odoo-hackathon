import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass } from '../../ui/components/common';
import {
  Clock, Calendar, CheckCircle2, AlertCircle, FileText, ArrowRight, MapPin,
  LogIn, LogOut, Target, Megaphone, Ticket, Users, CalendarDays, ChevronLeft, ChevronRight, Home, Navigation, Crosshair, Building2, RotateCcw
} from 'lucide-react';
import { getCurrentGPSLocation, type GPSCoords } from '../../utils/geoUtils';

function parseCheckInToDate(str: string): Date | null {
  if (!str) return null;
  const clean = str.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (clean.includes('T')) {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return d;
  }

  const match = clean.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const period = match[4] ? match[4].toUpperCase() : null;

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const d = new Date();
    d.setHours(hours, minutes, seconds, 0);
    return d;
  }

  return null;
}

const LiveTimer: React.FC<{ checkInTimeString: string }> = React.memo(({ checkInTimeString }) => {
  const [displayTime, setDisplayTime] = useState('00:00:00');

  useEffect(() => {
    const update = () => {
      const checkInDate = parseCheckInToDate(checkInTimeString);
      if (!checkInDate) {
        setDisplayTime('00:00:00');
        return;
      }

      const diff = Math.max(0, Math.floor((Date.now() - checkInDate.getTime()) / 1000));
      const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const secs = String(diff % 60).padStart(2, '0');
      const formatted = `${hrs}:${mins}:${secs}`;
      setDisplayTime(prev => (prev !== formatted ? formatted : prev));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [checkInTimeString]);

  const [hrs, mins, secs] = displayTime.split(':');
  const hDigits = (hrs || '00').padStart(2, '0').split('');
  const mDigits = (mins || '00').padStart(2, '0').split('');
  const sDigits = (secs || '00').padStart(2, '0').split('');

  const renderDigitTile = (digit: string, key: string, isAccent = false) => (
    <span
      key={key}
      style={{
        width: '32px',
        height: '42px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: '6px',
        fontSize: '1.45rem',
        fontWeight: 800,
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        fontVariantNumeric: 'tabular-nums',
        color: isAccent ? 'var(--accent)' : 'var(--primary)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        userSelect: 'none',
        flexShrink: 0,
        boxSizing: 'border-box',
        lineHeight: 1,
      }}
    >
      {digit}
    </span>
  );

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '.35rem',
        background: 'var(--surface-2)',
        padding: '.6rem 1rem',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-strong)',
        boxShadow: 'var(--shadow-xs)',
        margin: '0 auto .25rem',
        userSelect: 'none',
        contain: 'layout paint',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--green)',
          boxShadow: '0 0 0 3px var(--green-bg)',
          marginRight: '.25rem',
          flexShrink: 0,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
        {renderDigitTile(hDigits[0], 'h0')}
        {renderDigitTile(hDigits[1], 'h1')}

        <span style={{ color: 'var(--text-4)', fontWeight: 800, fontSize: '1.2rem', padding: '0 2px', userSelect: 'none', lineHeight: 1 }}>:</span>

        {renderDigitTile(mDigits[0], 'm0')}
        {renderDigitTile(mDigits[1], 'm1')}

        <span style={{ color: 'var(--text-4)', fontWeight: 800, fontSize: '1.2rem', padding: '0 2px', userSelect: 'none', lineHeight: 1 }}>:</span>

        {renderDigitTile(sDigits[0], 's0', true)}
        {renderDigitTile(sDigits[1], 's1', true)}
      </div>
    </div>
  );
});

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser, attendance, leaveRequests, wfhRequests, announcements, users,
    checkIn, checkOut, resetTodayAttendance, cancelLeave, setActiveTab,
    markAnnouncementRead, companyLocation, locationSchedules, hasApprovedWFHToday
  } = useApp();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayRecord = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === today);
  const isWFHApproved = hasApprovedWFHToday(currentUser.employeeId);

  // Check today's location from locationSchedules or companyLocation
  const todayScheduledLoc = locationSchedules.find(l => l.date === today);
  const defaultLocName = todayScheduledLoc ? todayScheduledLoc.location : (isWFHApproved ? 'Work From Home' : companyLocation);

  const [location, setLocation] = useState(defaultLocName);
  const [checkInMode, setCheckInMode] = useState<'campus' | 'wfh'>(isWFHApproved ? 'wfh' : 'campus');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [, setCurrentGPS] = useState<GPSCoords | null>(null);

  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const dateHeading = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const shortDateHeading = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, []);

  const handleDetectGPS = async () => {
    setGpsLoading(true);
    try {
      const coords = await getCurrentGPSLocation();
      setCurrentGPS(coords);
      if (coords.address) setLocation(coords.address);
      else setLocation(`${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°`);
    } catch {
      alert('Could not fetch GPS location. Please check browser permissions.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handlePerformEmployeeCheckIn = async () => {
    const finalLoc = checkInMode === 'wfh' ? (location || 'Work From Home') : (location || defaultLocName);
    await checkIn(finalLoc, checkInMode);
  };

  // Calendar helpers
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const myAttendance = attendance.filter(a => a.employeeId === currentUser.employeeId);
  const myLeaves = leaveRequests.filter(r => r.employeeId === currentUser.employeeId);
  const myWFH = wfhRequests.filter(r => r.employeeId === currentUser.employeeId);
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

  // Team presence in employee's department
  const teamMembers = users.filter(u => u.departmentId === currentUser.departmentId && u.id !== currentUser.id && u.employeeId !== currentUser.employeeId);
  const unreadAnn = announcements.filter(a => !a.readBy.includes(currentUser.employeeId));
  const myGoals = currentUser.goals || [];

  // Recent 5 attendance logs (sorted descending by date)
  const recentAttendanceLogs = [...myAttendance]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Combined recent requests (Leaves + WFH)
  const recentRequests = [
    ...myLeaves.map(l => ({
      id: l.id,
      type: `${l.leaveType} Leave`,
      dateText: l.startDate === l.endDate ? l.startDate : `${l.startDate} to ${l.endDate}`,
      daysCount: l.daysCount,
      reason: l.reason,
      status: l.status,
      appliedOn: l.appliedOn,
      isLeave: true,
      comments: l.adminComments
    })),
    ...myWFH.map(w => ({
      id: w.id,
      type: 'Work From Home',
      dateText: w.date,
      daysCount: 1,
      reason: w.reason,
      status: w.status,
      appliedOn: w.appliedOn,
      isLeave: false,
      comments: w.adminComments
    }))
  ].sort((a, b) => b.appliedOn.localeCompare(a.appliedOn)).slice(0, 4);

  const getPresenceBadge = (memberEmpId: string) => {
    const rec = attendance.find(a => a.employeeId === memberEmpId && a.date === today);
    const onLeave = leaveRequests.some(l => l.employeeId === memberEmpId && l.startDate <= today && l.endDate >= today && l.status === 'Approved');
    const onWFH = wfhRequests.some(w => w.employeeId === memberEmpId && w.date === today && w.status === 'Approved');

    if (onLeave) return <span className="badge badge-purple" style={{ fontSize: '.68rem' }}>On Leave</span>;
    if (onWFH || rec?.status === 'WFH') return <span className="badge badge-info" style={{ fontSize: '.68rem' }}>WFH</span>;
    if (rec?.checkIn) return <span className="badge badge-active" style={{ fontSize: '.68rem' }}>Office ({rec.checkIn})</span>;
    return <span className="badge badge-neutral" style={{ fontSize: '.68rem' }}>Offline</span>;
  };

  const UPCOMING_HOLIDAYS = [
    { title: 'Labor Day', date: 'Sep 01', day: 'Monday', type: 'Public Holiday' },
    { title: 'Q3 Hackathon & Demo Day', date: 'Sep 15', day: 'Monday', type: 'Company Event' },
    { title: 'Global Team Offsite', date: 'Oct 10', day: 'Friday', type: 'Work Event' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="banner banner-purple" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="banner-tag"><span style={{ fontSize: '.85rem' }}>👋</span> EMPLOYEE SELF-SERVICE PORTAL</div>
            <h2>{greeting}, {currentUser.name.split(' ')[0]}!</h2>
            <p>{currentUser.designation} · {currentUser.departmentName}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, opacity: .9 }}>{dateHeading}</div>
            <div style={{ fontSize: '.82rem', opacity: .75, marginTop: '.15rem' }}>Employee ID: {currentUser.employeeId}</div>
          </div>
        </div>
      </div>

      {/* Leave Balance Quick Widgets */}
      <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card">
          <div><div className="stat-num">{currentUser.leaveBalances.paid}</div><div className="stat-label">Paid Leave Days</div></div>
          <div className="stat-icon"><Calendar size={20} /></div>
        </div>
        <div className="stat-card teal">
          <div><div className="stat-num">{currentUser.leaveBalances.sick}</div><div className="stat-label">Sick Leave Days</div></div>
          <div className="stat-icon teal"><Calendar size={20} /></div>
        </div>
        <div className="stat-card yellow">
          <div><div className="stat-num">{currentUser.leaveBalances.casual}</div><div className="stat-label">Casual Leave Days</div></div>
          <div className="stat-icon yellow"><Calendar size={20} /></div>
        </div>
        <div className="stat-card purple">
          <div><div className="stat-num">${currentUser.salary.netSalary.toLocaleString()}</div><div className="stat-label">Monthly Net Pay</div></div>
          <div className="stat-icon purple"><FileText size={20} /></div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="quick-action-grid">
        <div className="quick-action-btn" onClick={() => setActiveTab('leaves')}>
          <div className="quick-action-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Calendar size={17} />
          </div>
          <div>
            <div className="quick-action-title">Apply Leave</div>
            <div className="quick-action-sub">Paid, Sick, Casual</div>
          </div>
        </div>

        <div className="quick-action-btn" onClick={() => setActiveTab('leaves')}>
          <div className="quick-action-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
            <Home size={17} />
          </div>
          <div>
            <div className="quick-action-title">Request WFH</div>
            <div className="quick-action-sub">Remote Day Approval</div>
          </div>
        </div>

        <div className="quick-action-btn" onClick={() => setActiveTab('tickets')}>
          <div className="quick-action-icon" style={{ background: 'var(--yellow-bg)', color: 'var(--yellow)' }}>
            <Ticket size={17} />
          </div>
          <div>
            <div className="quick-action-title">Raise Ticket</div>
            <div className="quick-action-sub">HR & IT Support</div>
          </div>
        </div>

        <div className="quick-action-btn" onClick={() => setActiveTab('payroll')}>
          <div className="quick-action-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
            <FileText size={17} />
          </div>
          <div>
            <div className="quick-action-title">My Payslips</div>
            <div className="quick-action-sub">Salary Breakdown</div>
          </div>
        </div>

        <div className="quick-action-btn" onClick={() => setActiveTab('team')}>
          <div className="quick-action-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Users size={17} />
          </div>
          <div>
            <div className="quick-action-title">Team Directory</div>
            <div className="quick-action-sub">Colleagues & Roles</div>
          </div>
        </div>
      </div>

      {/* Standard Executive Dashboard 2-Column Grid */}
      <div className="dashboard-grid">

        {/* Primary Left Column */}
        <div className="dashboard-col">

          {/* Today's Check-In Widget */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Clock size={18} color="var(--accent)" /> Today's Attendance Check-In</h3>
              <span style={{ fontSize: '.8rem', color: 'var(--text-3)', fontWeight: 600 }}>
                {shortDateHeading}
              </span>
            </div>
            <div className="card-flat" style={{ textAlign: 'center', padding: '1.25rem 1rem', minHeight: '210px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {todayRecord?.checkIn && !todayRecord.checkOut ? (
                <>
                  <LiveTimer checkInTimeString={todayRecord.checkIn} />
                  <p style={{ fontSize: '.82rem', color: 'var(--text-3)', marginTop: '.35rem' }}>Checked in at <strong>{todayRecord.checkIn}</strong> · {todayRecord.location}</p>
                  <button className="btn btn-danger btn-full" style={{ marginTop: '1rem' }} onClick={checkOut}><LogOut size={15} /> Check Out Now</button>
                </>
              ) : todayRecord?.checkOut ? (
                <>
                  <CheckCircle2 size={42} color="var(--green)" style={{ margin: '0 auto .5rem' }} />
                  <h4 style={{ fontWeight: 700 }}>Shift Complete!</h4>
                  <p style={{ fontSize: '.83rem', color: 'var(--text-3)', marginTop: '.25rem' }}>In: {todayRecord.checkIn} · Out: {todayRecord.checkOut} ({todayRecord.workHours} hrs)</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '.85rem' }} onClick={() => resetTodayAttendance()}><RotateCcw size={13} /> Re-Check In / New Shift</button>
                </>
              ) : todayRecord?.status === 'Leave' ? (
                <>
                  <Calendar size={36} color="var(--purple)" style={{ margin: '0 auto .5rem' }} />
                  <h4 style={{ fontWeight: 700, color: 'var(--purple)' }}>On Approved Leave</h4>
                </>
              ) : (
                <div style={{ width: '100%' }}>
                  <AlertCircle size={32} color="var(--text-4)" style={{ margin: '0 auto .4rem' }} />
                  <p style={{ fontSize: '.83rem', color: 'var(--text-3)', marginBottom: '.75rem' }}>Not checked in for today.</p>

                  {/* Mode Selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem', marginBottom: '.75rem' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${checkInMode === 'campus' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => { setCheckInMode('campus'); setLocation(defaultLocName); }}
                      style={{ fontSize: '.75rem' }}
                    >
                      <Building2 size={13} /> Office Campus
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm ${checkInMode === 'wfh' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => { setCheckInMode('wfh'); setLocation('Work From Home'); }}
                      style={{ fontSize: '.75rem', borderColor: checkInMode === 'wfh' ? 'var(--blue)' : undefined, background: checkInMode === 'wfh' ? 'var(--blue)' : undefined }}
                    >
                      <Home size={13} /> Work From Home
                    </button>
                  </div>

                  {checkInMode === 'campus' && (
                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.25rem' }}>
                        <label className="form-label" style={{ margin: 0 }}>Campus / Location</label>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={handleDetectGPS}
                          disabled={gpsLoading}
                          style={{ fontSize: '.72rem', color: 'var(--accent)', padding: 0 }}
                        >
                          <Navigation size={11} /> {gpsLoading ? 'Detecting...' : '📍 Detect GPS'}
                        </button>
                      </div>
                      <div className="input-icon-wrap">
                        <MapPin size={15} className="input-icon" />
                        <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)} placeholder="Main HQ Campus" />
                      </div>
                    </div>
                  )}

                  <button className="btn btn-primary btn-full" onClick={handlePerformEmployeeCheckIn}>
                    <LogIn size={15} /> Check In Now ({checkInMode === 'wfh' ? 'WFH' : 'Office'})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Goals & Key Results Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Target size={18} color="var(--primary)" /> My Goals & Key Results</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('goals')}>View All <ArrowRight size={13} /></button>
            </div>
            {myGoals.length === 0 ? (
              <div className="card-flat" style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ fontSize: '.83rem', color: 'var(--text-3)' }}>No active goals assigned yet.</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '.6rem' }} onClick={() => setActiveTab('goals')}>
                  Explore Goals & Performance
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                {myGoals.slice(0, 3).map(g => (
                  <div key={g.id} className="card-flat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.83rem', fontWeight: 700, marginBottom: '.35rem' }}>
                      <span>{g.title}</span>
                      <span className={getBadgeClass(g.status || 'In Progress')} style={{ fontSize: '.7rem' }}>{g.progress}% · {g.status}</span>
                    </div>
                    {g.description && <p style={{ fontSize: '.76rem', color: 'var(--text-3)', marginBottom: '.5rem' }}>{g.description}</p>}
                    <div style={{ background: 'var(--border)', height: 7, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${g.progress}%`, background: 'var(--primary)', height: '100%', borderRadius: 99, transition: 'width .3s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--text-4)', marginTop: '.35rem' }}>
                      <span>Target: {g.quarter || 'Q3 2026'}</span>
                      <span>Due: {g.dueDate || 'End of Quarter'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Recent Requests & Approvals */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Calendar size={18} color="var(--purple)" /> Recent Requests & Approvals</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('leaves')}>All Requests <ArrowRight size={13} /></button>
            </div>
            {recentRequests.length === 0 ? (
              <div className="card-flat" style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ fontSize: '.83rem', color: 'var(--text-3)' }}>No recent leave or WFH requests.</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '.6rem' }} onClick={() => setActiveTab('leaves')}>
                  Apply For Leave / WFH
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                {recentRequests.map(req => (
                  <div key={req.id} className="card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-1)' }}>{req.type}</span>
                        <span className={getBadgeClass(req.status)}>{req.status}</span>
                      </div>
                      <div style={{ fontSize: '.76rem', color: 'var(--text-3)', marginTop: '.15rem' }}>
                        {req.dateText} {req.daysCount > 1 ? `(${req.daysCount} days)` : ''} · Reason: {req.reason || 'Personal'}
                      </div>
                      {req.comments && <div style={{ fontSize: '.72rem', color: 'var(--accent)', marginTop: '.15rem' }}>Admin note: {req.comments}</div>}
                    </div>

                    {req.status === 'Pending' && req.isLeave && (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', fontSize: '.73rem', padding: '2px 8px' }} onClick={() => cancelLeave(req.id)}>
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Attendance Log (Past 5 Days) */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Clock size={18} color="var(--accent)" /> Recent Attendance Log</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('attendance')}>Full Log <ArrowRight size={13} /></button>
            </div>
            {recentAttendanceLogs.length === 0 ? (
              <p style={{ fontSize: '.83rem', color: 'var(--text-3)' }}>No previous attendance records found.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendanceLogs.map(rec => (
                      <tr key={rec.id}>
                        <td style={{ fontWeight: 600 }}>{rec.date}</td>
                        <td>{rec.checkIn || '—'}</td>
                        <td>{rec.checkOut || '—'}</td>
                        <td>{rec.workHours ? `${rec.workHours}h` : '—'}</td>
                        <td><span className={getBadgeClass(rec.status)}>{rec.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Secondary Right Column */}
        <div className="dashboard-col">

          {/* Mini Calendar */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><CalendarDays size={18} color="var(--primary)" /> Attendance Calendar</h3>
            </div>
            <div className="mini-cal">
              <div className="cal-header">
                <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}><ChevronLeft size={16} /></button>
                <span>{monthName}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}><ChevronRight size={16} /></button>
              </div>
              <div className="cal-grid">
                {['S','M','T','W','T','F','S'].map((d, i) => <div key={`hdr-${i}`} className="cal-day-header">{d}</div>)}
                {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                  <div key={`day-${day}`} className={getCalDayClass(day)}>{day}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.85rem', flexWrap: 'wrap', fontSize: '.73rem', fontWeight: 600, color: 'var(--text-3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />Present</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', display: 'inline-block' }} />Leave</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />Absent</span>
              </div>
            </div>
          </div>

          {/* Company Announcements */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Megaphone size={18} color="var(--yellow)" /> Recent Announcements</h3>
              {unreadAnn.length > 0 && <span className="badge badge-urgent">{unreadAnn.length} New</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
              {announcements.slice(0, 3).map(a => (
                <div key={a.id} className="card-flat" style={{ cursor: 'pointer' }} onClick={() => markAnnouncementRead(a.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '.84rem' }}>{a.title}</span>
                    <span className={getBadgeClass(a.priority)}>{a.priority}</span>
                  </div>
                  <p style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>{a.content}</p>
                  <div style={{ fontSize: '.7rem', color: 'var(--text-4)', marginTop: '.3rem' }}>By {a.postedBy} · {a.postedOn}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Presence in My Department */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Users size={18} color="var(--accent)" /> Team Presence ({currentUser.departmentName})</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('team')}>View All <ArrowRight size={13} /></button>
            </div>
            {teamMembers.length === 0 ? (
              <p style={{ fontSize: '.83rem', color: 'var(--text-3)' }}>No other department members.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {teamMembers.slice(0, 4).map(member => (
                  <div key={member.id} className="presence-row">
                    <div className="presence-info">
                      <img src={member.avatar} alt={member.name} className="presence-avatar" />
                      <div>
                        <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-1)' }}>{member.name}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>{member.designation}</div>
                      </div>
                    </div>
                    {getPresenceBadge(member.employeeId)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Holidays & Events */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Calendar size={18} color="var(--green)" /> Upcoming Holidays & Events</h3>
            </div>
            <div>
              {UPCOMING_HOLIDAYS.map((holiday, idx) => (
                <div key={idx} className="holiday-card">
                  <div className="holiday-date-badge">
                    {holiday.date.split(' ')[0]}<br/>{holiday.date.split(' ')[1]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--text-1)' }}>{holiday.title}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{holiday.day} · {holiday.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
