import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, ShieldCheck, User as UserIcon, LogOut, RotateCcw, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { currentUser, users, switchUser, notifications, markNotificationRead, resetToDefaultData } = useApp();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadNotifs = notifications.filter(n => 
    !n.read && (n.forRole ? n.forRole === currentUser.role : true) && (n.forEmployeeId ? n.forEmployeeId === currentUser.employeeId : true)
  );

  return (
    <>
      {/* Top Demo Quick Switcher Header */}
      <div className="top-demo-bar">
        <div className="demo-title">
          <Sparkles size={16} />
          <span>DAYFLOW HACKATHON DEMO MODE</span>
          <span style={{ opacity: 0.7, fontWeight: 400 }}>| Switch active role below:</span>
        </div>
        <div className="role-switcher-chips">
          {users.map(u => {
            const isActive = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`chip-btn ${isActive ? 'active' : ''}`}
                title={`Switch view to ${u.name} (${u.role})`}
              >
                {u.role === 'admin' ? <ShieldCheck size={13} /> : <UserIcon size={13} />}
                <span>{u.name.split(' ')[0]} ({u.role.toUpperCase()})</span>
              </button>
            );
          })}
          <button 
            onClick={resetToDefaultData} 
            className="chip-btn" 
            style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            title="Reset demo data to initial defaults"
          >
            <RotateCcw size={13} /> Reset Demo
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <div className="brand-title">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="#714B67"/>
              <circle cx="15" cy="20" r="6" fill="#00A09D"/>
              <circle cx="25" cy="20" r="6" fill="#FFFFFF" fillOpacity="0.8"/>
            </svg>
            Dayflow <span>HRMS</span>
          </div>
        </div>

        <div className="navbar-right">
          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              className="icon-btn" 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadNotifs.length > 0 && (
                <span className="notif-badge">{unreadNotifs.length}</span>
              )}
            </button>

            {showNotifDropdown && (
              <div 
                className="card" 
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  width: '340px',
                  zIndex: 250,
                  boxShadow: 'var(--shadow-xl)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unreadNotifs.length} unread</span>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: n.read ? 'transparent' : 'var(--primary-light)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{n.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Badge */}
          <div className="user-profile-badge">
            <img src={currentUser.avatar} alt={currentUser.name} className="avatar-img" />
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role-tag">
                {currentUser.role === 'admin' ? 'HR Officer / Admin' : currentUser.designation}
              </span>
            </div>
            <button 
              onClick={onOpenAuth} 
              className="icon-btn" 
              style={{ width: '28px', height: '28px', marginLeft: '0.25rem' }} 
              title="Sign In / Register modal"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
