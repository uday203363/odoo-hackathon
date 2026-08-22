import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, FileText, Play, CheckCircle2, Search, Filter, ShieldCheck } from 'lucide-react';
import { PayslipModal } from '../common/PayslipModal';

export const PayrollManager: React.FC = () => {
  const { currentUser, users, payroll, processMonthlyPayroll, setActivePayslip, activePayslip } = useApp();
  const isAdmin = currentUser.role === 'admin';

  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter records
  const displayPayroll = payroll.filter(p => {
    if (!isAdmin && p.employeeId !== currentUser.employeeId) return false;
    const matchesSearch = p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || p.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === 'All' || p.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  const totalDisbursed = displayPayroll.reduce((sum, p) => sum + p.netPay, 0);

  const handleRunPayroll = () => {
    if (confirm(`Execute monthly payroll distribution for ${selectedMonth}? This will auto-generate payslips for all active employees.`)) {
      processMonthlyPayroll(selectedMonth);
    }
  };

  const getEmployeeObj = (empId: string) => {
    return users.find(u => u.employeeId === empId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e1e2d 0%, #714b67 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <DollarSign size={14} /> PAYROLL & SALARY DISBURSEMENT
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Employee Payroll & Payslips
            </h2>
            <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
              {isAdmin ? 'Manage monthly salary structures, deductions, and execute batch payroll distribution.' : 'View your monthly payslip history and salary breakdown.'}
            </p>
          </div>

          {isAdmin && (
            <button onClick={handleRunPayroll} className="btn btn-accent" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
              <Play size={18} /> Execute Batch Payroll Run
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-data">
            <h3>${currentUser.salary.netSalary.toLocaleString()}</h3>
            <p>Your Monthly Net Pay</p>
          </div>
          <div className="metric-icon-box">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="metric-card accent-teal">
          <div className="metric-data">
            <h3>${currentUser.salary.basic.toLocaleString()}</h3>
            <p>Basic Salary Component</p>
          </div>
          <div className="metric-icon-box" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <FileText size={24} />
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="metric-card accent-amber">
              <div className="metric-data">
                <h3>{displayPayroll.length} Payslips</h3>
                <p>Processed Records ({selectedMonth})</p>
              </div>
              <div className="metric-icon-box" style={{ background: '#fffbe6', color: '#f59e0b' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="metric-card accent-purple">
              <div className="metric-data">
                <h3>${totalDisbursed.toLocaleString()}</h3>
                <p>Total Net Payroll Disbursed</p>
              </div>
              <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                <ShieldCheck size={24} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter and Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="card-title">
            <FileText size={20} color="var(--primary)" />
            {isAdmin ? 'Workforce Monthly Payroll Registry' : 'My Payslip Records'}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {isAdmin && (
              <div style={{ position: 'relative', width: '200px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search employee..."
                  style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.85rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select 
                className="form-control" 
                style={{ height: '36px', fontSize: '0.85rem' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="All">All Months</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Pay Period</th>
                <th>Employee</th>
                <th>Basic Pay</th>
                <th>Gross Earnings</th>
                <th>Deductions (Tax + PF)</th>
                <th>Net Payable</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayPayroll.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No payroll records found for this period.
                  </td>
                </tr>
              ) : (
                displayPayroll.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.month}</strong></td>
                    <td>
                      <div>
                        <strong>{p.employeeName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{p.employeeId}</span>
                      </div>
                    </td>
                    <td>${p.basic.toLocaleString()}</td>
                    <td>${p.grossPay.toLocaleString()}</td>
                    <td style={{ color: '#dc2626' }}>-${(p.pfDeduction + p.taxDeduction).toLocaleString()}</td>
                    <td><strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>${p.netPay.toLocaleString()}</strong></td>
                    <td>
                      <span className="badge badge-approved">
                        <CheckCircle2 size={12} /> {p.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setActivePayslip(p)} 
                        className="btn btn-outline btn-sm"
                      >
                        <FileText size={14} /> View Payslip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Print/Download Modal */}
      {activePayslip && (
        <PayslipModal 
          payroll={activePayslip}
          employee={getEmployeeObj(activePayslip.employeeId)}
          onClose={() => setActivePayslip(null)}
        />
      )}
    </div>
  );
};
