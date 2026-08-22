import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Plus, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';
import type { LeaveType, LeaveRequest } from '../../types';

export const LeaveManager: React.FC = () => {
  const { currentUser, leaveRequests, applyLeave, reviewLeaveRequest } = useApp();
  const isAdmin = currentUser.role === 'admin';

  // Apply Leave Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('Paid');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Review Modal
  const [selectedReqForReview, setSelectedReqForReview] = useState<LeaveRequest | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Calculate day count preview
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for your leave request.');
      return;
    }
    applyLeave(leaveType, startDate, endDate, reason);
    setShowApplyModal(false);
    setReason('');
  };

  const handleConfirmReview = (status: 'Approved' | 'Rejected') => {
    if (selectedReqForReview) {
      reviewLeaveRequest(selectedReqForReview.id, status, reviewComments || (status === 'Approved' ? 'Approved by HR' : 'Rejected by HR'));
      setSelectedReqForReview(null);
    }
  };

  // Filter requests
  const displayRequests = leaveRequests.filter(r => {
    if (!isAdmin && r.employeeId !== currentUser.employeeId) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #4e2a4b 0%, #714b67 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <Calendar size={14} /> TIME-OFF & LEAVE MANAGEMENT
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Leave Applications & Approvals
            </h2>
            <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
              {isAdmin ? 'Manage workforce leave approvals and balances.' : 'Apply for paid time off, sick leave, or personal leaves.'}
            </p>
          </div>

          <button 
            onClick={() => setShowApplyModal(true)} 
            className="btn btn-accent"
            style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}
          >
            <Plus size={18} /> Apply For Leave
          </button>
        </div>
      </div>

      {/* Employee Leave Balance Widgets */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-data">
            <h3>{currentUser.leaveBalances.paid} Days</h3>
            <p>Paid Leave Remaining</p>
          </div>
          <div className="metric-icon-box">
            <Calendar size={24} />
          </div>
        </div>

        <div className="metric-card accent-teal">
          <div className="metric-data">
            <h3>{currentUser.leaveBalances.sick} Days</h3>
            <p>Sick Leave Remaining</p>
          </div>
          <div className="metric-icon-box" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="metric-card accent-amber">
          <div className="metric-data">
            <h3>{currentUser.leaveBalances.casual} Days</h3>
            <p>Casual Leave Remaining</p>
          </div>
          <div className="metric-icon-box" style={{ background: '#fffbe6', color: '#f59e0b' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="metric-card accent-purple">
          <div className="metric-data">
            <h3>{leaveRequests.filter(r => r.employeeId === currentUser.employeeId && r.status === 'Pending').length}</h3>
            <p>Your Pending Requests</p>
          </div>
          <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="card-title">
            <Calendar size={20} color="var(--primary)" />
            {isAdmin ? 'All Company Leave Applications' : 'My Leave History'}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select 
              className="form-control" 
              style={{ height: '36px', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Only</option>
              <option value="Approved">Approved Only</option>
              <option value="Rejected">Rejected Only</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                {isAdmin && <th>Employee</th>}
                <th>Leave Type</th>
                <th>Dates Range</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>HR Remarks</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {displayRequests.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                displayRequests.map(r => (
                  <tr key={r.id}>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img src={r.employeeAvatar} alt={r.employeeName} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <strong style={{ display: 'block' }}>{r.employeeName}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.employeeDepartment}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    <td><span className="badge badge-leave">{r.leaveType}</span></td>
                    <td>{r.startDate} to {r.endDate}</td>
                    <td><strong>{r.daysCount} days</strong></td>
                    <td style={{ maxWidth: '220px' }}>{r.reason}</td>
                    <td>{r.appliedOn}</td>
                    <td>
                      <span className={`badge badge-${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.adminComments || '—'}</td>
                    {isAdmin && (
                      <td>
                        {r.status === 'Pending' ? (
                          <button 
                            onClick={() => { setSelectedReqForReview(r); setReviewComments(''); }} 
                            className="btn btn-primary btn-sm"
                          >
                            Review
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Reviewed by {r.reviewedBy || 'HR'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Apply for Leave / Time-Off</h3>
              <button onClick={() => setShowApplyModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitLeave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Leave Category</label>
                  <select 
                    className="form-control" 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  >
                    <option value="Paid">Paid Leave ({currentUser.leaveBalances.paid} days remaining)</option>
                    <option value="Sick">Sick Leave ({currentUser.leaveBalances.sick} days remaining)</option>
                    <option value="Casual">Casual Leave ({currentUser.leaveBalances.casual} days remaining)</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Total requested duration: <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{diffDays} Business Day(s)</strong>
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Remarks for HR</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    required
                    placeholder="Brief explanation for your time-off request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Leave Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HR Review Modal */}
      {selectedReqForReview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Review Leave Application</h3>
              <button onClick={() => setSelectedReqForReview(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <p><strong>Employee:</strong> {selectedReqForReview.employeeName} ({selectedReqForReview.employeeDepartment})</p>
                <p><strong>Leave Type:</strong> {selectedReqForReview.leaveType} Leave</p>
                <p><strong>Dates:</strong> {selectedReqForReview.startDate} to {selectedReqForReview.endDate} ({selectedReqForReview.daysCount} days)</p>
                <p><strong>Reason:</strong> {selectedReqForReview.reason}</p>
              </div>

              <div className="form-group">
                <label className="form-label">HR Comments for Employee</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Optional comments or instructions..."
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => handleConfirmReview('Rejected')} className="btn btn-danger">
                <XCircle size={16} /> Reject Application
              </button>
              <button onClick={() => handleConfirmReview('Approved')} className="btn btn-success">
                <CheckCircle2 size={16} /> Approve Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
