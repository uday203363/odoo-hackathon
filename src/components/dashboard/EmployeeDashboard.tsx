import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Calendar, CheckCircle2, AlertCircle, FileText, ArrowRight, MapPin, User, LogIn, LogOut } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { currentUser, attendance, leaveRequests, checkInUser, checkOutUser, setCurrentTab } = useApp();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === todayStr);

  const [locationInput, setLocationInput] = useState('Main HQ Office');
  const [timerStr, setTimerStr] = useState('00:00:00');

  // Live timer for checked-in status
  useEffect(() => {
    let interval: any;
    if (todayRecord && todayRecord.checkIn && !todayRecord.checkOut) {
      interval = setInterval(() => {
        const now = new Date();
        const [time, period] = todayRecord.checkIn!.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const checkInDate = new Date();
        checkInDate.setHours(hours, minutes, 0, 0);

        const diffSecs = Math.max(0, Math.floor((now.getTime() - checkInDate.getTime()) / 1000));
        const h = String(Math.floor(diffSecs / 3600)).padStart(2, '0');
        const m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0');
        const s = String(diffSecs % 60).padStart(2, '0');
        setTimerStr(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      setTimerStr('00:00:00');
    }

    return () => clearInterval(interval);
  }, [todayRecord]);

  const myLeaves = leaveRequests.filter(r => r.employeeId === currentUser.employeeId);
  const pendingLeaves = myLeaves.filter(r => r.status === 'Pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, #714b67 0%, #4e2a4b 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
            EMPLOYEE DASHBOARD
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
            Welcome back, {currentUser.name}! 👋
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '600px', marginTop: '0.25rem' }}>
            {currentUser.designation} • {currentUser.department} Department
          </p>
        </div>
      </div>

      {/* Metric Cards - Leave Balances */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-data">
            <h3>{currentUser.leaveBalances.paid} Days</h3>
            <p>Paid Leave Balance</p>
          </div>
          <div className="metric-icon-box">
            <Calendar size={24} />
          </div>
        </div>

        <div className="metric-card accent-teal">
          <div className="metric-data">
            <h3>{currentUser.leaveBalances.sick} Days</h3>
            <p>Sick Leave Balance</p>
          </div>
          <div className="metric-icon-box" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="metric-card accent-amber">
          <div className="metric-data">
            <h3>{pendingLeaves.length}</h3>
            <p>Pending Requests</p>
          </div>
          <div className="metric-icon-box" style={{ background: '#fffbe6', color: '#f59e0b' }}>
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="metric-card accent-purple">
          <div className="metric-data">
            <h3>${currentUser.salary.netSalary.toLocaleString()}</h3>
            <p>Monthly Net Pay</p>
          </div>
          <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Attendance Widget */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={20} color="var(--primary)" />
              Daily Attendance Check-In
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            {todayRecord?.checkIn && !todayRecord.checkOut ? (
              <>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {timerStr}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Checked in at <strong style={{ color: 'var(--text-main)' }}>{todayRecord.checkIn}</strong> ({todayRecord.location})
                </p>

                <button 
                  onClick={() => checkOutUser()} 
                  className="btn btn-danger" 
                  style={{ marginTop: '1.25rem', width: '100%' }}
                >
                  <LogOut size={16} /> Check Out Now
                </button>
              </>
            ) : todayRecord?.checkOut ? (
              <div>
                <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Day Completed!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  In: {todayRecord.checkIn} • Out: {todayRecord.checkOut} ({todayRecord.workHours} hrs logged)
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  You haven't checked in for today yet.
                </p>

                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Check-In Location</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ paddingLeft: '2rem' }}
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => checkInUser(locationInput)} 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                >
                  <LogIn size={16} /> Check In Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <button 
              onClick={() => setCurrentTab('profile')} 
              className="btn btn-outline" 
              style={{ padding: '1.25rem 1rem', flexDirection: 'column', height: '100px' }}
            >
              <User size={24} color="var(--primary)" />
              <span>View Profile</span>
            </button>

            <button 
              onClick={() => setCurrentTab('attendance')} 
              className="btn btn-outline" 
              style={{ padding: '1.25rem 1rem', flexDirection: 'column', height: '100px' }}
            >
              <Clock size={24} color="var(--accent)" />
              <span>Attendance History</span>
            </button>

            <button 
              onClick={() => setCurrentTab('leave')} 
              className="btn btn-outline" 
              style={{ padding: '1.25rem 1rem', flexDirection: 'column', height: '100px' }}
            >
              <Calendar size={24} color="#f59e0b" />
              <span>Apply for Leave</span>
            </button>

            <button 
              onClick={() => setCurrentTab('payroll')} 
              className="btn btn-outline" 
              style={{ padding: '1.25rem 1rem', flexDirection: 'column', height: '100px' }}
            >
              <FileText size={24} color="#8b5cf6" />
              <span>View Salary Slips</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Leave Statuses */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Recent Leave Requests</h3>
          <button onClick={() => setCurrentTab('leave')} className="btn btn-outline btn-sm">
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>HR Comments</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No leave applications logged.</td>
                </tr>
              ) : (
                myLeaves.slice(0, 3).map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.leaveType} Leave</strong></td>
                    <td>{r.startDate} to {r.endDate}</td>
                    <td>{r.daysCount} days</td>
                    <td>{r.reason}</td>
                    <td>
                      <span className={`badge badge-${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.adminComments || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
