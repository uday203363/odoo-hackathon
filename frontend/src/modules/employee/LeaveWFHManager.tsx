import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, EmptyState, Modal } from '../../ui/components/common';
import { CalendarDays, Plus, CheckCircle2, XCircle, Home } from 'lucide-react';
import type { LeaveType } from '../../types';

export const LeaveWFHManager: React.FC = () => {
  const { currentUser, leaveRequests, wfhRequests, reviewLeave, reviewWFH, applyLeave, applyWFH, cancelLeave } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [tab, setTab] = useState<'leave' | 'wfh'>('leave');
  const [leaveModal, setLeaveModal] = useState(false);
  const [wfhModal, setWfhModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: 'Paid' as LeaveType, start: '', end: '', reason: '' });
  const [wfhForm, setWfhForm] = useState({ date: '', reason: '' });
  const [reviewItem, setReviewItem] = useState<any>(null);
  const [reviewType, setReviewType] = useState<'leave' | 'wfh'>('leave');
  const [comments, setComments] = useState('');

  const myLeaves = isAdmin ? leaveRequests : leaveRequests.filter(r => r.employeeId === currentUser.employeeId);
  const myWFH = isAdmin ? wfhRequests : wfhRequests.filter(r => r.employeeId === currentUser.employeeId);

  const handleApplyLeave = () => {
    applyLeave(leaveForm.type, leaveForm.start, leaveForm.end, leaveForm.reason);
    setLeaveModal(false); setLeaveForm({ type: 'Paid', start: '', end: '', reason: '' });
  };

  const handleApplyWFH = () => {
    applyWFH(wfhForm.date, wfhForm.reason);
    setWfhModal(false); setWfhForm({ date: '', reason: '' });
  };

  const handleReview = (status: 'Approved' | 'Rejected') => {
    if (reviewType === 'leave') reviewLeave(reviewItem.id, status, comments);
    else reviewWFH(reviewItem.id, status, comments);
    setReviewItem(null); setComments('');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>{isAdmin ? 'Leave & WFH Approvals' : 'My Leaves & WFH'}</h1><p>{isAdmin ? 'Review and manage all leave and WFH requests.' : 'Apply for leave or request work from home.'}</p></div>
          {!isAdmin && (
            <div style={{ display: 'flex', gap: '.6rem' }}>
              <button className="btn btn-outline" onClick={() => setWfhModal(true)}><Home size={15} /> Request WFH</button>
              <button className="btn btn-primary" onClick={() => setLeaveModal(true)}><Plus size={15} /> Apply Leave</button>
            </div>
          )}
        </div>
      </div>

      {/* Leave Balance (Employee) */}
      {!isAdmin && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>My Leave Balances</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '.75rem' }}>
            {[
              { label: 'Paid', val: currentUser.leaveBalances.paid, color: 'var(--primary)' },
              { label: 'Sick', val: currentUser.leaveBalances.sick, color: 'var(--accent)' },
              { label: 'Casual', val: currentUser.leaveBalances.casual, color: 'var(--yellow)' },
              { label: 'Unpaid', val: currentUser.leaveBalances.unpaid, color: 'var(--text-4)' },
            ].map(b => (
              <div key={b.label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '.85rem', textAlign: 'center', borderTop: `3px solid ${b.color}` }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: b.color }}>{b.val}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>{b.label} Leave</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'leave' ? 'active' : ''}`} onClick={() => setTab('leave')}><CalendarDays size={14} style={{ marginRight: 4 }} />Leave Requests ({myLeaves.length})</button>
        <button className={`tab-btn ${tab === 'wfh' ? 'active' : ''}`} onClick={() => setTab('wfh')}><Home size={14} style={{ marginRight: 4 }} />WFH Requests ({myWFH.length})</button>
      </div>

      {tab === 'leave' && (
        myLeaves.length === 0
          ? <EmptyState icon={<CalendarDays size={40} />} title="No Leave Requests" subtitle={isAdmin ? 'No pending leave requests.' : 'Apply for leave using the button above.'} />
          : myLeaves.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: '.85rem', borderLeft: `3px solid ${r.status === 'Approved' ? 'var(--green)' : r.status === 'Rejected' ? 'var(--red)' : 'var(--yellow)'}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.85rem' }}>
                <img src={r.employeeAvatar} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.25rem' }}>
                    {isAdmin && <strong style={{ fontSize: '.9rem' }}>{r.employeeName}</strong>}
                    <span className={getBadgeClass(r.leaveType)} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{r.leaveType}</span>
                    <span className={getBadgeClass(r.status)}>{r.status}</span>
                  </div>
                  <p style={{ fontSize: '.83rem', color: 'var(--text-2)', marginBottom: '.2rem' }}>
                    {r.startDate} → {r.endDate} <strong>({r.daysCount} day{r.daysCount > 1 ? 's' : ''})</strong>
                    {isAdmin && <span style={{ fontSize: '.75rem', color: 'var(--text-4)', marginLeft: '.5rem' }}>· {r.employeeDepartment}</span>}
                  </p>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>Reason: {r.reason}</p>
                  {r.adminComments && <p style={{ fontSize: '.78rem', color: 'var(--accent)', marginTop: '.3rem' }}>HR: {r.adminComments}</p>}
                </div>
                <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0 }}>
                  {isAdmin && r.status === 'Pending' && (
                    <button className="btn btn-primary btn-sm" onClick={() => { setReviewItem(r); setReviewType('leave'); setComments(''); }}>Review</button>
                  )}
                  {!isAdmin && r.status === 'Pending' && (
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--red)' }} onClick={() => cancelLeave(r.id)}><XCircle size={13} /> Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))
      )}

      {tab === 'wfh' && (
        myWFH.length === 0
          ? <EmptyState icon={<Home size={40} />} title="No WFH Requests" subtitle={isAdmin ? 'No WFH requests.' : 'Request work from home using the button above.'} />
          : myWFH.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: '.85rem', borderLeft: `3px solid ${r.status === 'Approved' ? 'var(--green)' : r.status === 'Rejected' ? 'var(--red)' : 'var(--blue)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                <img src={r.employeeAvatar} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  {isAdmin && <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '.1rem' }}>{r.employeeName} <span style={{ fontSize: '.75rem', color: 'var(--text-4)' }}>({r.department})</span></div>}
                  <div style={{ fontSize: '.83rem' }}><strong>WFH Date:</strong> {r.date}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>Reason: {r.reason}</div>
                  {r.adminComments && <div style={{ fontSize: '.78rem', color: 'var(--accent)', marginTop: '.2rem' }}>HR: {r.adminComments}</div>}
                </div>
                <span className={getBadgeClass(r.status)}>{r.status}</span>
                {isAdmin && r.status === 'Pending' && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setReviewItem(r); setReviewType('wfh'); setComments(''); }}>Review</button>
                )}
              </div>
            </div>
          ))
      )}

      {/* Apply Leave Modal */}
      <Modal open={leaveModal} onClose={() => setLeaveModal(false)} title="Apply for Leave" size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setLeaveModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleApplyLeave}><CalendarDays size={15} /> Submit</button></>}>
        <div className="form-group"><label className="form-label">Leave Type</label>
          <select className="form-control" value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value as LeaveType })}>
            <option>Paid</option><option>Sick</option><option>Casual</option><option>Unpaid</option><option>Maternity</option><option>Paternity</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">From Date</label><input type="date" className="form-control" value={leaveForm.start} onChange={e => setLeaveForm({ ...leaveForm, start: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">To Date</label><input type="date" className="form-control" value={leaveForm.end} onChange={e => setLeaveForm({ ...leaveForm, end: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Reason *</label><textarea className="form-control" rows={3} value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} /></div>
      </Modal>

      {/* WFH Modal */}
      <Modal open={wfhModal} onClose={() => setWfhModal(false)} title="Request Work From Home" size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setWfhModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleApplyWFH}><Home size={15} /> Submit WFH</button></>}>
        <div className="form-group"><label className="form-label">WFH Date</label><input type="date" className="form-control" value={wfhForm.date} onChange={e => setWfhForm({ ...wfhForm, date: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Reason *</label><textarea className="form-control" rows={3} value={wfhForm.reason} onChange={e => setWfhForm({ ...wfhForm, reason: e.target.value })} /></div>
      </Modal>

      {/* Review Modal */}
      <Modal open={!!reviewItem} onClose={() => setReviewItem(null)} title="Review Request" size="sm"
        footer={<><button className="btn btn-danger" onClick={() => handleReview('Rejected')}><XCircle size={14} /> Reject</button><button className="btn btn-success" onClick={() => handleReview('Approved')}><CheckCircle2 size={14} /> Approve</button></>}>
        {reviewItem && <div>
          <div className="card-flat" style={{ marginBottom: '1rem' }}>
            <p><strong>Employee:</strong> {reviewItem.employeeName}</p>
            {reviewType === 'leave'
              ? <><p><strong>Type:</strong> {reviewItem.leaveType}</p><p><strong>Dates:</strong> {reviewItem.startDate} → {reviewItem.endDate}</p><p><strong>Reason:</strong> {reviewItem.reason}</p></>
              : <><p><strong>WFH Date:</strong> {reviewItem.date}</p><p><strong>Reason:</strong> {reviewItem.reason}</p></>
            }
          </div>
          <div className="form-group"><label className="form-label">HR Comments</label><textarea className="form-control" rows={3} value={comments} onChange={e => setComments(e.target.value)} /></div>
        </div>}
      </Modal>
    </div>
  );
};
