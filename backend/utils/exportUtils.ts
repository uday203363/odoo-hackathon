// ============================================================
// BACKEND — CSV / Report Export utilities
// ============================================================

export const downloadCSV = (filename: string, rows: string[][]): void => {
  const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportEmployeesCSV = (users: any[]): void => {
  const headers = ['ID', 'Name', 'Email', 'Designation', 'Department', 'Status', 'Join Date', 'Net Salary'];
  const rows = users.map(u => [
    u.employeeId, u.name, u.email, u.designation,
    u.departmentName, u.employmentStatus, u.joinDate, String(u.salary.netSalary)
  ]);
  downloadCSV('Dayflow_Employees', [headers, ...rows]);
};

export const exportLeaveCSV = (leaves: any[]): void => {
  const headers = ['ID', 'Employee', 'Department', 'Type', 'Start', 'End', 'Days', 'Status', 'Applied On'];
  const rows = leaves.map(l => [
    l.id, l.employeeName, l.employeeDepartment, l.leaveType,
    l.startDate, l.endDate, String(l.daysCount), l.status, l.appliedOn
  ]);
  downloadCSV('Dayflow_Leaves', [headers, ...rows]);
};

export const exportPayrollCSV = (payroll: any[]): void => {
  const headers = ['ID', 'Employee', 'Month', 'Gross Pay', 'Deductions', 'Net Pay', 'Status'];
  const rows = payroll.map(p => [
    p.id, p.employeeName, p.month,
    String(p.grossPay), String(p.totalDeductions), String(p.netPay), p.paymentStatus
  ]);
  downloadCSV('Dayflow_Payroll', [headers, ...rows]);
};

export const exportAttendanceCSV = (records: any[]): void => {
  const headers = ['Date', 'Employee', 'Check In', 'Check Out', 'Hours', 'Status', 'Location'];
  const rows = records.map(r => [
    r.date, r.employeeName, r.checkIn || '—', r.checkOut || '—',
    String(r.workHours), r.status, r.location || '—'
  ]);
  downloadCSV('Dayflow_Attendance', [headers, ...rows]);
};
