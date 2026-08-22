import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { exportEmployeesCSV, exportLeaveCSV, exportPayrollCSV } from '../../utils/exportUtils';

const BarChartSVG: React.FC<{ data: { label: string; value: number; color: string }[]; max?: number }> = ({ data, max }) => {
  const maxVal = max || Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: 140, padding: '0 8px' }}>
      {data.map(d => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-2)' }}>{d.value}</span>
          <div style={{ width: '100%', background: `${d.color}22`, borderRadius: '4px 4px 0 0', height: `${(d.value / maxVal) * 100}px`, position: 'relative', overflow: 'hidden', minHeight: 4 }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: d.color, borderRadius: '4px 4px 0 0', height: '100%', transition: 'height .5s ease' }} />
          </div>
          <span style={{ fontSize: '.68rem', color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const DonutSVG: React.FC<{ segments: { label: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return null;
  let offset = 0;
  const r = 50, cx = 60, cy = 60, circumference = 2 * Math.PI * r;
  return (
    <div className="donut-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((seg, i) => {
          const frac = seg.value / total;
          const dash = frac * circumference;
          const gap = circumference - dash;
          const rotation = offset * 360 - 90;
          offset += frac;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
              strokeWidth="20" strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rotation} ${cx} ${cy})`} />
          );
        })}
        <text x={cx} y={cy} dominantBaseline="middle" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text-1)">{total}</text>
      </svg>
      <div className="donut-legend">
        {segments.map(s => (
          <div key={s.label} className="donut-legend-item">
            <div className="donut-dot" style={{ background: s.color }} />
            <span>{s.label}: <strong>{s.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HRAnalytics: React.FC = () => {
  const { users, attendance, leaveRequests, payroll, departments } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const todayAtt = attendance.filter(a => a.date === today);

  const leaveByType = ['Paid', 'Sick', 'Casual', 'Unpaid'].map(type => ({
    label: type, value: leaveRequests.filter(l => l.leaveType === type).length,
    color: ['var(--primary)', 'var(--accent)', 'var(--yellow)', 'var(--text-4)'][['Paid', 'Sick', 'Casual', 'Unpaid'].indexOf(type)]
  }));

  const attendanceByStatus = ['Present', 'Absent', 'Late', 'WFH', 'Leave'].map(s => ({
    label: s, value: todayAtt.filter(a => a.status === s).length,
    color: { Present: 'var(--green)', Absent: 'var(--red)', Late: 'var(--yellow)', WFH: 'var(--blue)', Leave: 'var(--purple)' }[s] || '#999'
  }));

  const payrollByDept = departments.map(d => {
    const deptUsers = users.filter(u => u.departmentId === d.id);
    const total = deptUsers.reduce((s, u) => s + u.salary.netSalary, 0);
    return { label: d.name.split(' ')[0], value: total, color: d.color };
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>HR Analytics</h1><p>Visual insights into workforce metrics, leave trends, and payroll.</p></div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => exportEmployeesCSV(users)}>Export Employees</button>
            <button className="btn btn-outline" onClick={() => exportLeaveCSV(leaveRequests)}>Export Leaves</button>
            <button className="btn btn-outline" onClick={() => exportPayrollCSV(payroll)}>Export Payroll</button>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card"><div><div className="stat-num">{users.length}</div><div className="stat-label">Total Headcount</div></div><div className="stat-icon"><Users size={20} /></div></div>
        <div className="stat-card teal"><div><div className="stat-num">{todayAtt.filter(a => ['Present', 'WFH'].includes(a.status)).length}</div><div className="stat-label">Present Today</div></div><div className="stat-icon teal"><TrendingUp size={20} /></div></div>
        <div className="stat-card yellow"><div><div className="stat-num">{leaveRequests.filter(l => l.status === 'Pending').length}</div><div className="stat-label">Pending Leaves</div></div><div className="stat-icon yellow"><Calendar size={20} /></div></div>
        <div className="stat-card green"><div><div className="stat-num">${payroll.filter(p => p.month === 'August 2026').reduce((s, p) => s + p.netPay, 0).toLocaleString()}</div><div className="stat-label">Aug Payroll Total</div></div><div className="stat-icon green"><DollarSign size={20} /></div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.25rem' }}><BarChart3 size={17} /> Today's Attendance Breakdown</h3>
          <BarChartSVG data={attendanceByStatus} max={users.length} />
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.25rem' }}><Calendar size={17} /> Leave Requests by Type</h3>
          <DonutSVG segments={leaveByType.filter(s => s.value > 0)} />
          <div className="chart-bar-wrap" style={{ marginTop: '1.25rem' }}>
            {leaveByType.map(item => (
              <div key={item.label} className="chart-bar-item">
                <div className="chart-bar-label"><span>{item.label}</span><span>{item.value}</span></div>
                <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${(item.value / Math.max(...leaveByType.map(x => x.value), 1)) * 100}%`, background: item.color }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.25rem' }}><DollarSign size={17} /> Net Payroll by Department</h3>
          <BarChartSVG data={payrollByDept} />
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.25rem' }}><Users size={17} /> Department Headcount</h3>
          <DonutSVG segments={departments.map(d => ({ label: d.name.split(' ')[0], value: users.filter(u => u.departmentId === d.id).length, color: d.color }))} />
          <div style={{ marginTop: '1rem' }}>
            {departments.map(d => {
              const count = users.filter(u => u.departmentId === d.id).length;
              return (
                <div key={d.id} className="chart-bar-item" style={{ marginBottom: '.5rem' }}>
                  <div className="chart-bar-label"><span>{d.name}</span><span>{count} emp</span></div>
                  <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${(count / users.length) * 100}%`, background: d.color }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
