import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Clock, LogIn, LogOut, Edit3, Search, CheckCircle2, UserCheck } from 'lucide-react';
import { exportAttendanceCSV } from '../../utils/exportUtils';
import type { AttendanceRecord } from '../../types';

export const AttendanceManager: React.FC = () => {
  const { attendance, users, currentUser, checkIn, checkOut, updateAttendance } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [editModal, setEditModal] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceRecord['status']>('Present');
  const [editNotes, setEditNotes] = useState('');
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const displayRecords = isAdmin
    ? attendance.filter(a => a.employeeName.toLowerCase().includes(search.toLowerCase()))
    : attendance.filter(a => a.employeeId === currentUser.employeeId);

  const todayRecord = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === today);

  const handleSaveEdit = () => {
    if (editModal) { updateAttendance(editModal.id, editStatus, editNotes); setEditModal(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>{isAdmin ? 'Attendance Management & Personal Log' : 'My Attendance'}</h1>
            <p>{isAdmin ? 'Track and manage company attendance & mark your personal check-in.' : 'Your attendance log and today\'s check-in status.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '.65rem' }}>
            {isAdmin && <button className="btn btn-outline" onClick={() => exportAttendanceCSV(attendance)}>Export CSV</button>}
            {!todayRecord?.checkIn && (
              <button className="btn btn-accent" onClick={() => checkIn()}>
                <LogIn size={15} /> Check In
              </button>
            )}
            {todayRecord?.checkIn && !todayRecord.checkOut && (
              <button className="btn btn-danger" onClick={checkOut}>
                <LogOut size={15} /> Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Today Personal Status Card (for both HR Admin & Employees) */}
      <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '3px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.65rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            <CheckCircle2 size={16} color="var(--accent)" /> Today's Attendance — {today} ({currentUser.name})
          </h3>
          {todayRecord?.checkIn && (
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--green)', background: 'var(--green-bg)', padding: '2px 8px', borderRadius: 99 }}>
              Logged {todayRecord.workHours > 0 ? `${todayRecord.workHours} hrs` : 'Active Shift'}
            </span>
          )}
        </div>
        
        {todayRecord ? (
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div><span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>STATUS</span><div style={{ marginTop: '.25rem' }}><span className={getBadgeClass(todayRecord.status)}>{todayRecord.status}</span></div></div>
            <div><span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>CHECK IN</span><div style={{ fontWeight: 700, marginTop: '.25rem' }}>{todayRecord.checkIn || '—'}</div></div>
            <div><span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>CHECK OUT</span><div style={{ fontWeight: 700, marginTop: '.25rem' }}>{todayRecord.checkOut || '—'}</div></div>
            <div><span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>LOCATION</span><div style={{ fontWeight: 700, marginTop: '.25rem' }}>{todayRecord.location || 'Main HQ'}</div></div>
          </div>
        ) : (
          <p style={{ fontSize: '.83rem', color: 'var(--text-3)', margin: 0 }}>
            You have not checked in yet today. Click the <strong>Check In</strong> button above to record your attendance.
          </p>
        )}
      </div>

      {/* Search Filter for Admin */}
      {isAdmin && (
        <div className="card" style={{ marginBottom: '1rem', padding: '.75rem 1rem' }}>
          <div className="input-icon-wrap">
            <Search size={15} className="input-icon" />
            <input className="form-control" placeholder="Search employee attendance records by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}
              <th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th>
              <th>Hours</th>{isAdmin && <th>Location</th>}<th>Notes</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayRecords.length === 0
              ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>No records found.</td></tr>
              : displayRecords.slice(0, 50).map(r => (
                <tr key={r.id}>
                  {isAdmin && <td><div className="emp-cell"><img src={users.find(u => u.employeeId === r.employeeId)?.avatar} alt="" className="emp-avatar" /><div><div className="emp-name">{r.employeeName}</div></div></div></td>}
                  <td style={{ fontWeight: 600 }}>{r.date}</td>
                  <td><span className={getBadgeClass(r.status)}>{r.status}</span></td>
                  <td>{r.checkIn || '—'}</td>
                  <td>{r.checkOut || '—'}</td>
                  <td>{r.workHours > 0 ? `${r.workHours}h` : '—'}</td>
                  {isAdmin && <td>{r.location || '—'}</td>}
                  <td style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>{r.notes || '—'}</td>
                  {isAdmin && <td><button className="btn btn-outline btn-sm" onClick={() => { setEditModal(r); setEditStatus(r.status); setEditNotes(r.notes || ''); }}><Edit3 size={13} /></button></td>}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Attendance Record" size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setEditModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveEdit}>Save</button></>}>
        {editModal && (
          <>
            <div className="card-flat" style={{ marginBottom: '1rem' }}>
              <p><strong>Employee:</strong> {editModal.employeeName}</p>
              <p><strong>Date:</strong> {editModal.date}</p>
              <p><strong>Check In:</strong> {editModal.checkIn || '—'} | <strong>Check Out:</strong> {editModal.checkOut || '—'}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={editStatus} onChange={e => setEditStatus(e.target.value as AttendanceRecord['status'])}>
                <option>Present</option><option>Absent</option><option>Late</option><option>Half-day</option><option>Leave</option><option>WFH</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={3} value={editNotes} onChange={e => setEditNotes(e.target.value)} /></div>
          </>
        )}
      </Modal>
    </div>
  );
};
