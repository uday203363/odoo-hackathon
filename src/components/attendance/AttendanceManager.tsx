import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, MapPin, CheckCircle2, Edit2, LogIn, LogOut, Filter, User } from 'lucide-react';
import type { AttendanceRecord } from '../../types';

export const AttendanceManager: React.FC = () => {
  const { currentUser, users, attendance, checkInUser, checkOutUser, updateAttendanceStatus } = useApp();
  
  const [selectedFilterEmp, setSelectedFilterEmp] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceRecord['status']>('Present');
  const [adminNotes, setAdminNotes] = useState('');

  const isAdmin = currentUser.role === 'admin';
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === todayStr);

  // Filter attendance records
  const displayRecords = attendance.filter(record => {
    // If regular employee, only show their own records
    if (!isAdmin && record.employeeId !== currentUser.employeeId) {
      return false;
    }
    
    const matchesEmp = selectedFilterEmp === 'All' || record.employeeId === selectedFilterEmp;
    const matchesStatus = selectedStatusFilter === 'All' || record.status === selectedStatusFilter;
    
    return matchesEmp && matchesStatus;
  });

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setNewStatus(rec.status);
    setAdminNotes(rec.notes || '');
  };

  const handleSaveEdit = () => {
    if (editingRecord) {
      updateAttendanceStatus(editingRecord.id, newStatus, adminNotes);
      setEditingRecord(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Attendance Header & Quick Action Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #00a09d 0%, #017e84 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <Clock size={14} /> REAL-TIME ATTENDANCE TRACKER
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Attendance & Work Hours Log
            </h2>
            <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
              Track daily shift check-ins, check-outs, location logs, and status entries.
            </p>
          </div>

          {/* Quick Check-in/out box for employee */}
          <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {todayRecord?.checkIn && !todayRecord.checkOut ? (
              <div>
                <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Checked in at <strong>{todayRecord.checkIn}</strong></p>
                <button onClick={() => checkOutUser()} className="btn btn-danger btn-sm" style={{ marginTop: '0.35rem' }}>
                  <LogOut size={14} /> Check Out Now
                </button>
              </div>
            ) : todayRecord?.checkOut ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={24} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Today's Shift Logged</span>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Status: Not Checked In</p>
                <button onClick={() => checkInUser('Main HQ')} className="btn btn-primary btn-sm" style={{ marginTop: '0.35rem', background: 'white', color: 'var(--accent)' }}>
                  <LogIn size={14} /> Quick Check-In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="card-title">
            <Filter size={18} color="var(--primary)" />
            Attendance Records Log
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} color="var(--text-muted)" />
                <select 
                  className="form-control" 
                  style={{ height: '36px', fontSize: '0.85rem' }}
                  value={selectedFilterEmp}
                  onChange={(e) => setSelectedFilterEmp(e.target.value)}
                >
                  <option value="All">All Employees</option>
                  {users.map(u => (
                    <option key={u.employeeId} value={u.employeeId}>{u.name} ({u.employeeId})</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
              <select 
                className="form-control" 
                style={{ height: '36px', fontSize: '0.85rem' }}
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half-day">Half-day</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Logged Hours</th>
                <th>Location / Notes</th>
                <th>Status</th>
                {isAdmin && <th>HR Action</th>}
              </tr>
            </thead>
            <tbody>
              {displayRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No attendance records match your filter criteria.
                  </td>
                </tr>
              ) : (
                displayRecords.map(rec => (
                  <tr key={rec.id}>
                    <td><strong>{rec.date}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>{rec.employeeName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({rec.employeeId})</span>
                      </div>
                    </td>
                    <td>{rec.checkIn || '—'}</td>
                    <td>{rec.checkOut || '—'}</td>
                    <td><strong>{rec.workHours ? `${rec.workHours} hrs` : 'In Progress'}</strong></td>
                    <td>
                      {rec.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <MapPin size={12} /> {rec.location}
                        </span>
                      )}
                      {rec.notes && <span style={{ fontSize: '0.8rem', fontStyle: 'italic', display: 'block' }}>{rec.notes}</span>}
                    </td>
                    <td>
                      <span className={`badge badge-${rec.status.toLowerCase().replace('-', '')}`}>
                        {rec.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <button onClick={() => handleOpenEdit(rec)} className="btn btn-outline btn-sm">
                          <Edit2 size={13} /> Adjust Status
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status Modal (Admin Only) */}
      {editingRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Adjust Employee Attendance Record</h3>
              <button onClick={() => setEditingRecord(null)}>✕</button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                Editing log for <strong>{editingRecord.employeeName}</strong> on <strong>{editingRecord.date}</strong>
              </p>

              <div className="form-group">
                <label className="form-label">Attendance Status</label>
                <select 
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AttendanceRecord['status'])}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">HR Adjustment Reason / Remarks</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="e.g. Manual override due to biometric system maintenance"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setEditingRecord(null)} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="btn btn-primary">
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
