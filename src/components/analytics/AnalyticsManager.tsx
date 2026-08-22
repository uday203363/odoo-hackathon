import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, PieChart, TrendingUp, Download, Users, Calendar, DollarSign } from 'lucide-react';

export const AnalyticsManager: React.FC = () => {
  const { users, leaveRequests, payroll } = useApp();

  // Metrics
  const totalEmp = users.length;
  const engineeringCount = users.filter(u => u.department === 'Engineering').length;
  const designCount = users.filter(u => u.department === 'Design').length;
  const financeCount = users.filter(u => u.department === 'Finance').length;
  const hrCount = users.filter(u => u.department === 'People & Culture').length;

  const totalLeaveApproved = leaveRequests.filter(r => r.status === 'Approved').length;
  const totalLeavePending = leaveRequests.filter(r => r.status === 'Pending').length;
  const totalLeaveRejected = leaveRequests.filter(r => r.status === 'Rejected').length;

  const totalPayrollCost = payroll.reduce((sum, p) => sum + p.netPay, 0);
  const avgSalary = Math.round(totalPayrollCost / Math.max(1, payroll.length));

  const exportCSVReport = (reportType: string) => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'employees') {
      csvContent += 'Employee ID,Name,Email,Department,Designation,Net Salary\n';
      users.forEach(u => {
        csvContent += `${u.employeeId},"${u.name}",${u.email},${u.department},"${u.designation}",${u.salary.netSalary}\n`;
      });
    } else if (reportType === 'leaves') {
      csvContent += 'Request ID,Employee Name,Leave Type,Start Date,End Date,Days,Status\n';
      leaveRequests.forEach(l => {
        csvContent += `${l.id},"${l.employeeName}",${l.leaveType},${l.startDate},${l.endDate},${l.daysCount},${l.status}\n`;
      });
    } else if (reportType === 'payroll') {
      csvContent += 'Payslip ID,Employee ID,Employee Name,Month,Gross Pay,Net Pay,Status\n';
      payroll.forEach(p => {
        csvContent += `${p.id},${p.employeeId},"${p.employeeName}",${p.month},${p.grossPay},${p.netPay},${p.paymentStatus}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dayflow_HRMS_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #017e84 0%, #714b67 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <BarChart3 size={14} /> HR ANALYTICS & EXECUTIVE REPORTING
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Workforce Intelligence Dashboard
            </h2>
            <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
              Visual breakdowns of department headcount, leave trends, attendance rates, and payroll budget metrics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => exportCSVReport('employees')} className="btn btn-outline" style={{ background: 'white', color: 'var(--primary)' }}>
              <Download size={15} /> Export Employees CSV
            </button>
            <button onClick={() => exportCSVReport('payroll')} className="btn btn-accent">
              <Download size={15} /> Export Payroll CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-data">
            <h3>{totalEmp}</h3>
            <p>Active Employees</p>
          </div>
          <div className="metric-icon-box">
            <Users size={24} />
          </div>
        </div>

        <div className="metric-card accent-teal">
          <div className="metric-data">
            <h3>${avgSalary.toLocaleString()}</h3>
            <p>Average Monthly Compensation</p>
          </div>
          <div className="metric-icon-box" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="metric-card accent-amber">
          <div className="metric-data">
            <h3>98.2%</h3>
            <p>Monthly Attendance Rate</p>
          </div>
          <div className="metric-icon-box" style={{ background: '#fffbe6', color: '#f59e0b' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="metric-card accent-purple">
          <div className="metric-data">
            <h3>{leaveRequests.length} Total</h3>
            <p>Leave Requests Logged</p>
          </div>
          <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Calendar size={24} />
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Department Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <PieChart size={20} color="var(--primary)" />
              Department Headcount Distribution
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                <span>Engineering ({engineeringCount})</span>
                <span>{Math.round((engineeringCount / totalEmp) * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(engineeringCount / totalEmp) * 100}%`, background: '#714b67', height: '100%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                <span>Design ({designCount})</span>
                <span>{Math.round((designCount / totalEmp) * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(designCount / totalEmp) * 100}%`, background: '#00a09d', height: '100%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                <span>Finance ({financeCount})</span>
                <span>{Math.round((financeCount / totalEmp) * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(financeCount / totalEmp) * 100}%`, background: '#f59e0b', height: '100%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                <span>People & Culture ({hrCount})</span>
                <span>{Math.round((hrCount / totalEmp) * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(hrCount / totalEmp) * 100}%`, background: '#8b5cf6', height: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Leave Status Metrics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={20} color="var(--accent)" />
              Leave Applications Breakdown
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center', margin: '1rem 0' }}>
            <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <h4 style={{ fontSize: '1.8rem', color: '#059669', fontWeight: 800 }}>{totalLeaveApproved}</h4>
              <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>Approved Leaves</span>
            </div>

            <div style={{ background: '#fffbe6', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
              <h4 style={{ fontSize: '1.8rem', color: '#d97706', fontWeight: 800 }}>{totalLeavePending}</h4>
              <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700 }}>Pending Review</span>
            </div>

            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
              <h4 style={{ fontSize: '1.8rem', color: '#dc2626', fontWeight: 800 }}>{totalLeaveRejected}</h4>
              <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 700 }}>Rejected Requests</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button onClick={() => exportCSVReport('leaves')} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
              <Download size={14} /> Download Detailed Leave Audit CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
