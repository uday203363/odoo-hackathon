import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Clock, Calendar, DollarSign, CheckCircle2, XCircle, Eye, Search, Filter, ShieldCheck, ArrowRight } from 'lucide-react';
import type { User } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { users, attendance, leaveRequests, payroll, reviewLeaveRequest, setSelectedEmployeeForView, setCurrentTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Review modal state
  const [activeReviewReq, setActiveReviewReq] = useState<any | null>(null);
  const [adminCommentInput, setAdminCommentInput] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Metrics
  const totalEmployees = users.length;
  const presentTodayCount = attendance.filter(a => a.date === todayStr && (a.status === 'Present' || a.status === 'Late')).length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');
  const totalMonthlyPayroll = payroll.filter(p => p.month === 'August 2026').reduce((sum, p) => sum + p.netPay, 0);

  const filteredEmployees = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || u.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleOpenReview = (req: any) => {
    setActiveReviewReq(req);
    setAdminCommentInput('');
  };

  const handleConfirmReview = (status: 'Approved' | 'Rejected') => {
    if (activeReviewReq) {
      reviewLeaveRequest(activeReviewReq.id, status, adminCommentInput || (status === 'Approved' ? 'Approved by HR' : 'Request rejected by HR'));
      setActiveReviewReq(null);
    }
  };

  const handleViewEmployee = (emp: User) => {
    setSelectedEmployeeForView(emp);
    setCurrentTab('profile');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1e2d 0%, #3a2d3c 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(0, 160, 157, 0.2)', color: '#00a09d', border: '1px solid #00a09d' }}>
              <ShieldCheck size={14} /> HR EXECUTIVE CONTROL CENTER
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Dayflow HR Management Hub
            </h2>
            <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Real-time monitoring of workforce operations, attendance logs, leave approvals, and payroll processing.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-data">
            <h3>{totalEmployees}</h3>
            <p>Total Workforce</p>
          </div>
          <div className="metric-icon-box">
            <Users size={24} />
          </div>
        </div>

        <div className="metric-card accent-teal">
          <div className="metric-data">
            <h3>{presentTodayCount} / {totalEmployees}</h3>
            <p>On-Duty Today</p>
          </div>
          <div className="metric-icon-box" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="metric-card accent-amber">
          <div className="metric-data">
            <h3>{pendingLeaves.length}</h3>
            <p>Pending Approvals</p>
          </div>
          <div className="metric-icon-box" style={{ background: '#fffbe6', color: '#f59e0b' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="metric-card accent-purple">
          <div className="metric-data">
            <h3>${totalMonthlyPayroll.toLocaleString()}</h3>
            <p>Monthly Payroll Total</p>
          </div>
          <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Pending Leave Approvals Queue */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={20} color="#f59e0b" />
            Pending Leave Requests ({pendingLeaves.length})
          </h3>
          <button onClick={() => setCurrentTab('leave')} className="btn btn-outline btn-sm">
            View All Leaves <ArrowRight size={14} />
          </button>
        </div>

        {pendingLeaves.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
            <p style={{ fontWeight: 600 }}>All leave applications are up to date! No pending requests.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates & Duration</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img src={r.employeeAvatar} alt={r.employeeName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ display: 'block' }}>{r.employeeName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td>{r.employeeDepartment}</td>
                    <td><span className="badge badge-leave">{r.leaveType} Leave</span></td>
                    <td>{r.startDate} to {r.endDate} ({r.daysCount} days)</td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reason}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleOpenReview(r)}
                          className="btn btn-primary btn-sm"
                        >
                          Review Request
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Workforce Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="card-title">
            <Users size={20} color="var(--primary)" />
            Workforce Employee List
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search employee..."
                style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.85rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select 
                className="form-control"
                style={{ height: '36px', padding: '0 0.5rem', fontSize: '0.85rem' }}
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Finance">Finance</option>
                <option value="People & Culture">People & Culture</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Today's Status</th>
                <th>Paid Leave Left</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => {
                const todayAtt = attendance.find(a => a.employeeId === emp.employeeId && a.date === todayStr);
                const statusStr = todayAtt ? todayAtt.status : 'Absent';
                
                return (
                  <tr key={emp.id}>
                    <td><code>{emp.employeeId}</code></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img src={emp.avatar} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ display: 'block' }}>{emp.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{emp.designation}</td>
                    <td>{emp.department}</td>
                    <td>
                      <span className={`badge badge-${statusStr.toLowerCase().replace('-', '')}`}>
                        {statusStr}
                      </span>
                    </td>
                    <td><strong>{emp.leaveBalances.paid}</strong> days</td>
                    <td>
                      <button 
                        onClick={() => handleViewEmployee(emp)} 
                        className="btn btn-outline btn-sm"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {activeReviewReq && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Review Leave Application</h3>
              <button onClick={() => setActiveReviewReq(null)}><XCircle size={20} /></button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <p><strong>Employee:</strong> {activeReviewReq.employeeName} ({activeReviewReq.employeeDepartment})</p>
                <p><strong>Leave Type:</strong> {activeReviewReq.leaveType} Leave</p>
                <p><strong>Dates:</strong> {activeReviewReq.startDate} to {activeReviewReq.endDate} ({activeReviewReq.daysCount} days)</p>
                <p><strong>Reason:</strong> {activeReviewReq.reason}</p>
              </div>

              <div className="form-group">
                <label className="form-label">HR Admin Comments / Notes</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Add notes for the employee..."
                  value={adminCommentInput}
                  onChange={(e) => setAdminCommentInput(e.target.value)}
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
