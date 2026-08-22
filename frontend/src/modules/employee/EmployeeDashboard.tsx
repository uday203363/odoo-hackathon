import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass } from '../../ui/components/common';
import {
  Clock, Calendar, CheckCircle2, AlertCircle, FileText, ArrowRight, MapPin,
  LogIn, LogOut, Target, Megaphone, Ticket, Users, CalendarDays, ChevronLeft, ChevronRight, Home, Navigation, Crosshair, Building2, RotateCcw
} from 'lucide-react';
import { getCurrentGPSLocation, type GPSCoords } from '../../utils/geoUtils';
import { parseCheckInToDate, formatWorkHours, getShiftMetrics } from '../../utils/timeUtils';

const LiveTimer: React.FC<{ checkInTimeString: string }> = React.memo(({ checkInTimeString }) => {
  const [displayTime, setDisplayTime] = useState('00:00:00');
  const [elapsedHours, setElapsedHours] = useState(0);

  useEffect(() => {
    const update = () => {
      const checkInDate = parseCheckInToDate(checkInTimeString);
      if (!checkInDate) {
        setDisplayTime('00:00:00');
        setElapsedHours(0);
        return;
      }

      const diffSecs = Math.max(0, Math.floor((Date.now() - checkInDate.getTime()) / 1000));
      const hrs = String(Math.floor(diffSecs / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0');
      const secs = String(diffSecs % 60).padStart(2, '0');
      setDisplayTime(`${hrs}:${mins}:${secs}`);
      setElapsedHours(diffSecs / 3600);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [checkInTimeString]);

  const metrics = getShiftMetrics(elapsedHours, 8.0);
  const [hrs, mins, secs] = displayTime.split(':');

  const renderTimeUnit = (value: string, label: string, isAccent = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '54px' }}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '8px',
          padding: '.35rem 0',
          fontSize: '1.4rem',
          fontWeight: 800,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
          color: isAccent ? 'var(--accent)' : 'var(--primary)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          width: '54px',
          textAlign: 'center',
          letterSpacing: '0',
          boxSizing: 'border-box',
        }}
      >
        {value}
      </div>
      <span style={{ fontSize: '.62rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', marginTop: '.25rem', letterSpacing: '.5px' }}>
        {label}
      </span>
    </div>
  );

  return (
    <div style={{ width: '100%', height: '140px', minHeight: '140px', maxHeight: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', userSelect: 'none', overflow: 'hidden' }}>
      {/* Live Timer Unit Box */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '.5rem',
          background: 'var(--surface-2)',
          padding: '.65rem 1.25rem',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-xs)',
          margin: '0 auto .65rem',
          width: '260px',
          height: '62px',
          minHeight: '62px',
          maxHeight: '62px',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 0 4px var(--green-bg)',
            marginRight: '.15rem',
            flexShrink: 0,
            alignSelf: 'center',
            marginTop: '-12px',
          }}
        />

        {renderTimeUnit(hrs || '00', 'HOURS')}
        <span style={{ color: 'var(--text-4)', fontWeight: 800, fontSize: '1.2rem', marginTop: '-12px', width: '8px', textAlign: 'center' }}>:</span>
        {renderTimeUnit(mins || '00', 'MINS')}
        <span style={{ color: 'var(--text-4)', fontWeight: 800, fontSize: '1.2rem', marginTop: '-12px', width: '8px', textAlign: 'center' }}>:</span>
        {renderTimeUnit(secs || '00', 'SECS', true)}
      </div>

      {/* Standard Daily Work Progress Bar */}
      <div style={{ width: '100%', maxWidth: '340px', height: '54px', minHeight: '54px', maxHeight: '54px', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: '.3rem', fontVariantNumeric: 'tabular-nums' }}>
          <span>Standard Shift Progress ({metrics.progressPercent}%)</span>
          <span style={{ color: metrics.isOvertime ? 'var(--green)' : 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.elapsedFormatted} / 8h 00m Target
          </span>
        </div>
        <div style={{ background: 'var(--surface-2)', height: 8, borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div
            style={{
              width: `${metrics.progressPercent}%`,
              background: metrics.isOvertime ? 'var(--green)' : 'var(--primary)',
              height: '100%',
              borderRadius: 99,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.71rem', color: 'var(--text-3)', marginTop: '.35rem', fontVariantNumeric: 'tabular-nums' }}>
          <span>{metrics.statusLabel}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {metrics.isOvertime ? `Overtime: ${metrics.overtimeFormatted}` : `Remaining: ${metrics.remainingFormatted}`}
          </span>
        </div>
      </div>
    </div>
  );
});

export const EmployeeDashboard: React.FC = () => {
  const { currentUser, attendance, leaveRequests, wfhRequests, announcements, users, checkIn, checkOut, resetTodayAttendance, setActiveTab, markAnnouncementRead, companyLocation, locationSchedules, hasApprovedWFHToday } = useApp();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayRecord = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === today);
  const isWFHApproved = hasApprovedWFHToday(currentUser.employeeId);

  // Check today's location from locationSchedules or companyLocation
  const todayScheduledLoc = locationSchedules.find(l => l.date === today);
  const defaultLocName = todayScheduledLoc ? todayScheduledLoc.location : (isWFHApproved ? 'Work From Home' : companyLocation);

  const [location, setLocation] = useState(defaultLocName);
  const [checkInMode, setCheckInMode] = useState<'campus' | 'wfh'>(isWFHApproved ? 'wfh' : 'campus');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [currentGPS, setCurrentGPS] = useState<GPSCoords | null>(null);

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
  const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getCalDayClass = (day: number): string => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === today;
    const dayOfWeek = new Date(calYear, calMonth, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const attRec = myAttendance.find(a => a.date === dateStr);
    const leaveRec = myLeaves.find(r => r.startDate <= dateStr && r.endDate >= dateStr && r.status === 'Approved');

    let cls = 'cal-day';

    if (attRec) {
      if (attRec.status === 'Absent') cls += ' absent';
      else if (attRec.status === 'Leave') cls += ' leave';
      else cls += ' has-event';
    } else if (leaveRec) {
      cls += ' leave';
    } else if (dateStr < today) {
      if (isWeekend) cls += ' weekend';
      else cls += ' has-event';
    } else if (isWeekend) {
      cls += ' weekend';
    }

    if (isToday) {
      cls += ' today';
    }

    return cls;
  };

  // Team presence
  const teamMembers = users.filter(u => u.departmentId === currentUser.departmentId && u.id !== currentUser.id);
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
            <div style={{ fontSize: '1.05rem', fontWeight: 700, opacity: .9 }}>{dateHeading}</div>
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
            <div className="card-flat" style={{ textAlign: 'center', padding: '1.25rem 1rem', minHeight: '230px', maxHeight: '230px', height: '230px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden' }}>
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
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'var(--green-bg)', color: 'var(--green)', padding: '.25rem .75rem', borderRadius: 99, fontSize: '.76rem', fontWeight: 700, margin: '.35rem 0 .4rem' }}>
                    <CheckCircle2 size={13} /> {todayRecord.workHours >= 8.0 ? 'Standard Shift Completed (8.0h Met)' : `Shift Completed (${formatWorkHours(todayRecord.workHours).formatted})`}
                  </div>
                  <p style={{ fontSize: '.83rem', color: 'var(--text-3)', marginTop: '.15rem' }}>
                    In: <strong>{todayRecord.checkIn}</strong> · Out: <strong>{todayRecord.checkOut}</strong>
                  </p>
                  <p style={{ fontSize: '.83rem', fontWeight: 700, color: 'var(--primary)', marginTop: '.15rem' }}>
                    Total Logged: {formatWorkHours(todayRecord.workHours).full}
                  </p>
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
              <p style={{ fontSize: '.83rem', color: 'var(--text-3)' }}>No goals assigned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                {myGoals.slice(0, 3).map(g => (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', fontWeight: 700, marginBottom: '.25rem' }}>
                      <span>{g.title}</span>
                      <span style={{ color: 'var(--primary)' }}>{g.progress}%</span>
                    </div>
                    <div style={{ background: 'var(--surface-2)', height: 7, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${g.progress}%`, background: 'var(--primary)', height: '100%', borderRadius: 99, transition: 'var(--t-normal)' }} />
                    </div>
                  </div>
                ))}
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
        </div>

      </div>
    </div>
  );
};
