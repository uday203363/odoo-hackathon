import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Users, Clock, CalendarDays, DollarSign, BarChart3, ShieldAlert } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, currentUser, leaveRequests } = useApp();

  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'Pending').length;

  return (
    <aside className="sidebar">
      <div className="nav-section-label">Main Navigation</div>

      <button
        onClick={() => setCurrentTab('dashboard')}
        className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
      >
        <LayoutDashboard className="icon" />
        <span>Dashboard</span>
      </button>

      <button
        onClick={() => setCurrentTab('profile')}
        className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`}
      >
        <Users className="icon" />
        <span>{currentUser.role === 'admin' ? 'Employees & Profiles' : 'My Profile'}</span>
      </button>

      <button
        onClick={() => setCurrentTab('attendance')}
        className={`nav-item ${currentTab === 'attendance' ? 'active' : ''}`}
      >
        <Clock className="icon" />
        <span>Attendance</span>
      </button>

      <button
        onClick={() => setCurrentTab('leave')}
        className={`nav-item ${currentTab === 'leave' ? 'active' : ''}`}
        style={{ position: 'relative' }}
      >
        <CalendarDays className="icon" />
        <span>Leave & Time-Off</span>
        {currentUser.role === 'admin' && pendingLeavesCount > 0 && (
          <span 
            style={{
              position: 'absolute',
              right: '12px',
              background: '#f59e0b',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.1rem 0.45rem',
              borderRadius: '999px'
            }}
          >
            {pendingLeavesCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setCurrentTab('payroll')}
        className={`nav-item ${currentTab === 'payroll' ? 'active' : ''}`}
      >
        <DollarSign className="icon" />
        <span>Payroll & Payslips</span>
      </button>

      <button
        onClick={() => setCurrentTab('analytics')}
        className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
      >
        <BarChart3 className="icon" />
        <span>Reports & Analytics</span>
      </button>

      <div style={{ marginTop: 'auto', padding: '1rem 0.5rem' }}>
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem' }}>
            <ShieldAlert size={14} /> Active Role
          </div>
          <p style={{ fontSize: '0.8rem', color: '#a2a3b7', marginTop: '0.25rem' }}>
            {currentUser.role === 'admin' ? 'Administrator Privilege' : 'Standard Employee'}
          </p>
        </div>
      </div>
    </aside>
  );
};
