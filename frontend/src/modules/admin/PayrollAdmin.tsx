import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { DollarSign, Eye, Printer, Download, Play, Plus } from 'lucide-react';
import type { PayrollRecord } from '../../types';
import { exportPayrollCSV, exportPayslipPDF } from '../../utils/exportUtils';

const Payslip: React.FC<{ p: PayrollRecord; empName: string; onClose: () => void }> = ({ p, onClose, empName }) => (
  <div>
    <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '1.25rem 1.5rem', borderRadius: 'var(--r-md)', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
        <div><p style={{ opacity: .75, fontSize: '.78rem' }}>PAYSLIP</p><h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{empName}</h3></div>
        <div style={{ textAlign: 'right' }}><p style={{ opacity: .75, fontSize: '.78rem' }}>PERIOD</p><strong>{p.month}</strong></div>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
      <div>
        <h4 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '.6rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>Earnings</h4>
        {[['Basic Salary', p.basic], ['HRA', p.hra], ['Conveyance', p.conveyance], ['Special Allowance', p.specialAllowance], ['Medical Allowance', p.medicalAllowance]].map(([l, v]) =>
          <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', padding: '.25rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-3)' }}>{l}</span><strong>${Number(v).toLocaleString()}</strong>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', fontWeight: 800, padding: '.5rem 0', color: 'var(--green)' }}><span>Gross Pay</span><span>${p.grossPay.toLocaleString()}</span></div>
      </div>
      <div>
        <h4 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '.6rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>Deductions</h4>
        {[['PF Deduction', p.pfDeduction], ['Income Tax', p.taxDeduction], ['Professional Tax', p.professionalTax]].map(([l, v]) =>
          <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', padding: '.25rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-3)' }}>{l}</span><strong style={{ color: 'var(--red)' }}>-${Number(v).toLocaleString()}</strong>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', fontWeight: 800, padding: '.5rem 0', color: 'var(--red)' }}><span>Total Deductions</span><span>-${p.totalDeductions.toLocaleString()}</span></div>
      </div>
    </div>
    <div style={{ background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))', color: '#fff', borderRadius: 'var(--r-md)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div><p style={{ opacity: .8, fontSize: '.78rem' }}>NET PAY</p><h2 style={{ fontSize: '2rem', fontWeight: 900 }}>${p.netPay.toLocaleString()}</h2></div>
      <div style={{ textAlign: 'right', fontSize: '.8rem', opacity: .85 }}><p>Days: {p.presentDays}/{p.workingDays}</p><p>Paid: {p.paymentDate || '—'}</p><span className={getBadgeClass(p.paymentStatus)} style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{p.paymentStatus}</span></div>
    </div>
  </div>
);

export const PayrollManager: React.FC = () => {
  const { payroll, users, currentUser, processPayroll } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [viewSlip, setViewSlip] = useState<PayrollRecord | null>(null);
  const [monthFilter, setMonthFilter] = useState('August 2026');
  const [processModal, setProcessModal] = useState(false);
  const [newMonth, setNewMonth] = useState('');

  const months = Array.from(new Set(['August 2026', ...payroll.map(p => p.month)]));

  // Build complete display array ensuring EVERY employee in users has a payroll record for monthFilter
  const displayPayroll: PayrollRecord[] = isAdmin
    ? users.map(u => {
        const existing = payroll.find(p => p.employeeId === u.employeeId && p.month === monthFilter);
        if (existing) return existing;
        const s = u.salary;
        const grossPay = s.basic + s.hra + s.conveyance + s.specialAllowance + s.medicalAllowance;
        const totalDeductions = s.pfDeduction + s.taxDeduction + s.professionalTax;
        return {
          id: `pay-${u.employeeId}-${monthFilter}`,
          employeeId: u.employeeId,
          employeeName: u.name,
          month: monthFilter,
          basic: s.basic,
          hra: s.hra,
          conveyance: s.conveyance,
          specialAllowance: s.specialAllowance,
          medicalAllowance: s.medicalAllowance,
          grossPay,
          pfDeduction: s.pfDeduction,
          taxDeduction: s.taxDeduction,
          professionalTax: s.professionalTax,
          totalDeductions,
          netPay: s.netSalary,
          paymentStatus: 'Paid',
          paymentDate: new Date().toISOString().split('T')[0],
          workingDays: 26,
          presentDays: 25,
        };
      })
    : payroll.filter(p => p.employeeId === currentUser.employeeId).sort((a, b) => b.month.localeCompare(a.month));

  const totalNet = displayPayroll.reduce((s, p) => s + p.netPay, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>{isAdmin ? 'Payroll Management' : 'My Payslips'}</h1><p>{isAdmin ? 'Process and manage employee salaries.' : 'View and download your pay history.'}</p></div>
          <div style={{ display: 'flex', gap: '.65rem' }}>
            {isAdmin && <button className="btn btn-outline" onClick={() => exportPayrollCSV(displayPayroll)}>Export CSV</button>}
            {isAdmin && <button className="btn btn-primary" onClick={() => setProcessModal(true)}><Play size={15} /> Run Payroll</button>}
          </div>
        </div>
      </div>

      {/* Month filter (admin) */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {months.map(m => <button key={m} className={`btn btn-sm ${monthFilter === m ? 'btn-primary' : 'btn-outline'}`} onClick={() => setMonthFilter(m)}>{m}</button>)}
        </div>
      )}

      {/* Summary cards */}
      {isAdmin && (
        <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="stat-card"><div><div className="stat-num">{displayPayroll.length}</div><div className="stat-label">Total Employees Paid</div></div><div className="stat-icon"><DollarSign size={20} /></div></div>
          <div className="stat-card teal"><div><div className="stat-num">${displayPayroll.reduce((s, p) => s + p.grossPay, 0).toLocaleString()}</div><div className="stat-label">Total Gross</div></div><div className="stat-icon teal"><DollarSign size={20} /></div></div>
          <div className="stat-card green"><div><div className="stat-num">${totalNet.toLocaleString()}</div><div className="stat-label">Total Net Disbursed</div></div><div className="stat-icon green"><DollarSign size={20} /></div></div>
          <div className="stat-card red"><div><div className="stat-num">${displayPayroll.reduce((s, p) => s + p.totalDeductions, 0).toLocaleString()}</div><div className="stat-label">Total Deductions</div></div></div>
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}
              <th>Month</th><th>Gross Pay</th><th>Deductions</th><th>Net Pay</th>
              <th>Days</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayPayroll.length === 0
              ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>No payroll data.</td></tr>
              : displayPayroll.map(p => {
                const emp = users.find(u => u.employeeId === p.employeeId);
                return (
                  <tr key={p.id}>
                    {isAdmin && <td><div className="emp-cell"><img src={emp?.avatar} alt="" className="emp-avatar" /><div><div className="emp-name">{p.employeeName}</div></div></div></td>}
                    <td style={{ fontWeight: 600 }}>{p.month}</td>
                    <td>${p.grossPay.toLocaleString()}</td>
                    <td style={{ color: 'var(--red)' }}>-${p.totalDeductions.toLocaleString()}</td>
                    <td style={{ fontWeight: 800, color: 'var(--green)' }}>${p.netPay.toLocaleString()}</td>
                    <td>{p.presentDays}/{p.workingDays}</td>
                    <td><span className={getBadgeClass(p.paymentStatus)}>{p.paymentStatus}</span></td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setViewSlip(p)}><Eye size={13} /> View</button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Payslip Modal */}
      <Modal open={!!viewSlip} onClose={() => setViewSlip(null)} title="Payslip Details" size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setViewSlip(null)}>Close</button>
            <button className="btn btn-outline" onClick={() => window.print()}><Printer size={14} /> Print Payslip</button>
            <button className="btn btn-primary" onClick={() => {
              if (viewSlip) {
                const empName = users.find(u => u.employeeId === viewSlip.employeeId)?.name || viewSlip.employeeName;
                exportPayslipPDF(viewSlip, empName);
              }
            }}><Download size={14} /> Download PDF</button>
          </>
        }>
        {viewSlip && <Payslip p={viewSlip} empName={users.find(u => u.employeeId === viewSlip.employeeId)?.name || viewSlip.employeeName} onClose={() => setViewSlip(null)} />}
      </Modal>

      {/* Process Payroll Modal */}
      <Modal open={processModal} onClose={() => setProcessModal(false)} title="Run Payroll" size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setProcessModal(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { processPayroll(newMonth); setProcessModal(false); }}><Play size={14} /> Process Payroll</button></>}>
        <p style={{ fontSize: '.88rem', color: 'var(--text-3)', marginBottom: '1rem' }}>This will generate payslips for all <strong>{users.length}</strong> active employees.</p>
        <div className="form-group"><label className="form-label">Month (e.g. "September 2026")</label><input className="form-control" value={newMonth} onChange={e => setNewMonth(e.target.value)} placeholder="September 2026" /></div>
      </Modal>
    </div>
  );
};
