import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, LogOut, Key, Server, Lock, LogIn, Clock } from 'lucide-react';
import { Modal } from '../components/common';
import type { NotificationItem } from '../../types';

interface NavbarProps { onOpenAuth: () => void; }

export const DemoBar: React.FC = () => {
  return null;
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { currentUser, attendance, checkOut, setActiveTab, notifications, announcements, markNotifRead, markAnnouncementRead, clearNotifs, toast, isBackendConnected } = useApp();
  const [open, setOpen] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [currPwd, setCurrPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const userTodayRec = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === today);

  // Convert announcements into notification items
  const announcementNotifs: NotificationItem[] = announcements.map(a => ({
    id: `notif-ann-${a.id}`,
    title: `📢 ${a.title}`,
    message: a.content,
    timestamp: a.postedOn,
    read: a.readBy?.includes(currentUser.employeeId) || false,
    type: a.priority === 'Urgent' ? 'alert' : 'info',
  }));

  // Merge announcements with system notifications
  const combinedNotifs = [...announcementNotifs, ...notifications];

  const userNotifs = combinedNotifs.filter(n =>
    (!n.forRole || n.forRole === currentUser.role) &&
    (!n.forEmployeeId || n.forEmployeeId === currentUser.employeeId)
  );
  const unread = userNotifs.filter(n => !n.read);

  const handleChangePassword = async () => {
    if (!newPwd || newPwd.length < 4) {
      setPwdError('New password must be at least 4 characters long.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match.');
      return;
    }

    try {
      if (isBackendConnected) {
        const res = await fetch(`/api/employees/${currentUser.id}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword: currPwd, newPassword: newPwd }),
        });
        const data = await res.json();
        if (data.success) {
          toast('Password changed successfully!', 'success');
          setPwdModal(false);
          setCurrPwd(''); setNewPwd(''); setConfirmPwd(''); setPwdError('');
        } else {
          setPwdError(data.message || 'Failed to change password');
        }
      } else {
        toast('Password updated locally!', 'success');
        setPwdModal(false);
        setCurrPwd(''); setNewPwd(''); setConfirmPwd(''); setPwdError('');
      }
    } catch {
      setPwdError('Error connecting to server.');
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#714B67"/>
            <circle cx="15" cy="20" r="7" fill="#00A09D"/>
            <circle cx="25" cy="20" r="7" fill="white" fillOpacity=".8"/>
          </svg>
          <span className="brand-name">Dayflow <span>HRMS</span></span>
        </div>

        <div className="navbar-right">
          {/* Quick Check-In / Check-Out Widget for HR Admin & Employees */}
          <div style={{ marginRight: '.5rem' }}>
            {!userTodayRec?.checkIn ? (
              <button className="btn btn-accent btn-sm" onClick={() => setActiveTab('attendance')}>
                <LogIn size={13} /> Check In
              </button>
            ) : !userTodayRec.checkOut ? (
              <button className="btn btn-danger btn-sm" onClick={checkOut}>
                <LogOut size={13} /> Check Out ({userTodayRec.checkIn})
              </button>
            ) : (
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--green)', background: 'var(--green-bg)', padding: '4px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> Shift Complete ({userTodayRec.workHours}h)
              </span>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setOpen(!open)}>
              <Bell size={19} />
              {unread.length > 0 && <span className="notif-count">{unread.length}</span>}
            </button>
            {open && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <h4>Notifications ({userNotifs.length})</h4>
                  <button className="btn btn-ghost btn-sm" onClick={clearNotifs}>Clear all</button>
                </div>
                <div className="notif-list">
                  {userNotifs.length === 0
                    ? <div className="empty-state" style={{ padding: '1.5rem' }}><p>No notifications</p></div>
                    : userNotifs.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => {
                          markNotifRead(n.id);
                          if (n.id.startsWith('notif-ann-')) {
                            markAnnouncementRead(n.id.replace('notif-ann-', ''));
                          }
                        }}
                      >
                        <div className="title">{n.title}</div>
                        <div className="msg">{n.message}</div>
                        <div className="time">{n.timestamp}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* User pill & Password change */}
          <div className="user-pill">
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveTab('profile')} title="View & Edit My Profile">
              <img src={currentUser.avatar} alt={currentUser.name} className="pill-avatar" />
            </div>
            <div style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')} title="View & Edit My Profile">
              <div className="pill-name">{currentUser.name}</div>
              <div className="pill-role">{currentUser.role === 'admin' ? 'HR Officer / Admin' : currentUser.designation}</div>
            </div>
            <button className="icon-btn" style={{ width: 28, height: 28, marginLeft: 4 }} onClick={() => setPwdModal(true)} title="Change Password">
              <Key size={14} />
            </button>
            <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onOpenAuth} title="Sign Out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Change Password Modal */}
      <Modal open={pwdModal} onClose={() => setPwdModal(false)} title="Change Password" size="sm"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setPwdModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleChangePassword}>Update Password</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pwdError && (
            <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: '.65rem .85rem', borderRadius: 'var(--r-md)', fontSize: '.82rem', fontWeight: 600 }}>
              {pwdError}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-control" type="password" placeholder="••••••••" value={currPwd} onChange={e => setCurrPwd(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">New Password (Min 4 characters)</label>
            <input className="form-control" type="password" placeholder="••••••••" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-control" type="password" placeholder="••••••••" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
          </div>
        </div>
      </Modal>
    </>
  );
};
