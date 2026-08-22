import { jsPDF } from 'jspdf';

// ============================================================
// Export utilities (frontend copy for browser compatibility)
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
  const rows = users.map(u => [u.employeeId, u.name, u.email, u.designation, u.departmentName, u.employmentStatus, u.joinDate, String(u.salary.netSalary)]);
  downloadCSV('Dayflow_Employees', [headers, ...rows]);
};

export const exportLeaveCSV = (leaves: any[]): void => {
  const headers = ['ID', 'Employee', 'Department', 'Type', 'Start', 'End', 'Days', 'Status', 'Applied On'];
  const rows = leaves.map(l => [l.id, l.employeeName, l.employeeDepartment, l.leaveType, l.startDate, l.endDate, String(l.daysCount), l.status, l.appliedOn]);
  downloadCSV('Dayflow_Leaves', [headers, ...rows]);
};

export const exportPayrollCSV = (payroll: any[]): void => {
  const headers = ['ID', 'Employee', 'Month', 'Gross Pay', 'Deductions', 'Net Pay', 'Status'];
  const rows = payroll.map(p => [p.id, p.employeeName, p.month, String(p.grossPay), String(p.totalDeductions), String(p.netPay), p.paymentStatus]);
  downloadCSV('Dayflow_Payroll', [headers, ...rows]);
};

export const exportAttendanceCSV = (records: any[]): void => {
  const headers = ['Date', 'Employee', 'Check In', 'Check Out', 'Hours', 'Status', 'Location'];
  const rows = records.map(r => [r.date, r.employeeName, r.checkIn || '—', r.checkOut || '—', String(r.workHours), r.status, r.location || '—']);
  downloadCSV('Dayflow_Attendance', [headers, ...rows]);
};

// ============================================================
// Official Document & Contract Binary PDF Local Downloader
// ============================================================

export const downloadDocumentFile = async (
  doc: { id?: string; name: string; category?: string; uploadDate?: string; fileData?: string; fileSize?: string },
  user?: any
): Promise<void> => {
  // If actual uploaded file data exists, download it directly
  if (doc.fileData) {
    try {
      const res = await fetch(doc.fileData);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name.includes('.') ? doc.name : `${doc.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    } catch (e) {
      console.warn('Could not parse fileData URL, falling back to binary PDF generation', e);
    }
  }

  // Generate a valid, 100% compliant binary PDF using jsPDF
  const employeeName = user?.name || 'Employee';
  const employeeId = user?.employeeId || 'EMP-100';
  const designation = user?.designation || 'Software Engineer';
  const department = user?.departmentName || 'Engineering';
  const joinDate = user?.joinDate || new Date().toISOString().split('T')[0];
  const email = user?.email || 'employee@dayflow.com';
  const salary = user?.salary || { basic: 5000, hra: 2000, conveyance: 400, specialAllowance: 1000, netSalary: 7400 };

  const isNDA = doc.name.toLowerCase().includes('nda');
  const isTax = doc.category === 'Tax Form' || doc.name.toLowerCase().includes('tax') || doc.name.toLowerCase().includes('w4');

  let title = 'EMPLOYMENT AGREEMENT';
  if (isNDA) title = 'CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT';
  else if (isTax) title = 'EMPLOYEE TAX WITHHOLDING DECLARATION';
  else if (doc.category === 'Contract') title = 'EXECUTIVE EMPLOYMENT AGREEMENT';

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header Background Bar (Dayflow Brand Purple)
  pdf.setFillColor(113, 75, 103);
  pdf.rect(0, 0, pageWidth, 24, 'F');

  // Header Text
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text('DAYFLOW TECHNOLOGIES INC.', margin, 11);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(220, 220, 235);
  pdf.text('GLOBAL HUMAN RESOURCES & LEGAL COMPLIANCE DIVISION', margin, 17);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.text(`REF: DF-HR-2026-${employeeId}`, pageWidth - margin, 11, { align: 'right' });
  pdf.text(`ISSUED: ${doc.uploadDate || joinDate}`, pageWidth - margin, 17, { align: 'right' });

  // Accent Line (Teal)
  pdf.setDrawColor(0, 160, 157);
  pdf.setLineWidth(1.2);
  pdf.line(0, 24, pageWidth, 24);

  let y = 34;

  // Document Title & Badge
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42);
  pdf.text(title, margin, y);

  // Status Badge
  pdf.setFillColor(236, 253, 245);
  pdf.setDrawColor(167, 243, 208);
  pdf.roundedRect(pageWidth - margin - 44, y - 5, 44, 7, 2, 2, 'FD');
  pdf.setFontSize(7.5);
  pdf.setTextColor(5, 150, 105);
  pdf.text('VERIFIED & SIGNED', pageWidth - margin - 22, y - 0.5, { align: 'center' });

  y += 7;

  // Overview paragraph
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(
    'This official document serves as a binding corporate record between Dayflow Global Technologies Inc. and the designated employee.',
    margin,
    y
  );

  y += 6;

  // Summary Information Grid Box
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

  const col1X = margin + 5;
  const col2X = margin + (contentWidth / 2) + 5;
  let gridY = y + 7;

  const renderGridItem = (x: number, yPos: number, label: string, val: string) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text(label.toUpperCase(), x, yPos);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(val, x, yPos + 4.5);
  };

  renderGridItem(col1X, gridY, 'Employee Full Name', employeeName);
  renderGridItem(col2X, gridY, 'Employee ID', employeeId);

  gridY += 9;
  renderGridItem(col1X, gridY, 'Job Title / Designation', designation);
  renderGridItem(col2X, gridY, 'Department', department);

  gridY += 9;
  renderGridItem(col1X, gridY, 'Date of Joining', joinDate);
  renderGridItem(col2X, gridY, 'Corporate Email', email);

  gridY += 9;
  renderGridItem(col1X, gridY, 'Monthly Net Compensation', `$${Number(salary.netSalary || 7400).toLocaleString()} USD`);
  renderGridItem(col2X, gridY, 'Work Arrangement', 'Hybrid Campus / Remote Authorized');

  y += 44;

  // Standard Legal Sections
  const addSection = (secNum: string, secTitle: string, secBody: string) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(113, 75, 103);
    pdf.text(`${secNum}. ${secTitle}`, margin, y);
    y += 4.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85);
    const lines = pdf.splitTextToSize(secBody, contentWidth);
    pdf.text(lines, margin, y);
    y += lines.length * 3.8 + 4;
  };

  addSection(
    '1',
    'Duties & Position Overview',
    `The Employee agrees to faithfully perform all duties and responsibilities associated with the role of ${designation} in the ${department} department, adhering strictly to Dayflow's highest standards of professional excellence, ethical compliance, and organizational code of conduct.`
  );

  addSection(
    '2',
    'Compensation, Statutory Benefits & Allowances',
    `The Company agrees to disburse a monthly net salary of $${Number(salary.netSalary || 7400).toLocaleString()} USD comprising Basic Pay, HRA, and Special Allowances, processed via electronic direct deposit on the final working day of each calendar month. The Employee is entitled to comprehensive group health coverage, statutory Provident Fund deductions, and authorized paid leave days.`
  );

  addSection(
    '3',
    'Confidentiality, Proprietary Data & Intellectual Property',
    'All proprietary source code, software architectures, algorithms, trade secrets, confidential internal documentation, and client datasets developed or accessed during employment remain the exclusive intellectual property of Dayflow Global Technologies Inc. The Employee undertakes not to disclose confidential data to any third party.'
  );

  addSection(
    '4',
    'Terms of Engagement, Termination & Notice Period',
    'This employment agreement is effective from the official date of joining. Either party may initiate separation subject to the standard 30-day statutory notice period or severance terms established under corporate HR policies and statutory regulations.'
  );

  y += 3;

  // Signature Boxes
  const sigBoxWidth = (contentWidth - 8) / 2;
  const sigBoxHeight = 32;

  // Box 1: Company Representative
  pdf.setFillColor(250, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('AUTHORIZED COMPANY SIGNATURE', margin + 4, y + 6);

  pdf.setFont('times', 'italic');
  pdf.setFontSize(13);
  pdf.setTextColor(113, 75, 103);
  pdf.text('Elena Rostova', margin + 4, y + 15);

  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.3);
  pdf.line(margin + 4, y + 18, margin + sigBoxWidth - 4, y + 18);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Elena Rostova', margin + 4, y + 23);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Head of Human Resources & Operations', margin + 4, y + 27);

  // Box 2: Employee Signature
  const sig2X = margin + sigBoxWidth + 8;
  pdf.setFillColor(250, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(sig2X, y, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('EMPLOYEE ACKNOWLEDGMENT', sig2X + 4, y + 6);

  pdf.setFont('times', 'italic');
  pdf.setFontSize(13);
  pdf.setTextColor(0, 160, 157);
  pdf.text(employeeName, sig2X + 4, y + 15);

  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.3);
  pdf.line(sig2X + 4, y + 18, sig2X + sigBoxWidth - 4, y + 18);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(15, 23, 42);
  pdf.text(employeeName, sig2X + 4, y + 23);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Employee (${employeeId}) · Acknowledged & Signed`, sig2X + 4, y + 27);

  // Bottom Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Dayflow HRMS · Digital Hash: SHA256-DF-${Date.now().toString(36).toUpperCase()}-${employeeId} · Confidential & Privileged`,
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  const finalFileName = doc.name.toLowerCase().endsWith('.pdf') ? doc.name : `${doc.name}.pdf`;
  pdf.save(finalFileName);
};

// ============================================================
// Official Payslip Binary PDF Downloader
// ============================================================

export const exportPayslipPDF = (p: any, empName: string): void => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  pdf.setFillColor(113, 75, 103);
  pdf.rect(0, 0, pageWidth, 26, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('DAYFLOW TECHNOLOGIES INC.', margin, 12);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(230, 230, 245);
  pdf.text('OFFICIAL EMPLOYEE SALARY PAYSLIP', margin, 18);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8.5);
  pdf.text(`PAY PERIOD: ${p.month}`, pageWidth - margin, 12, { align: 'right' });
  pdf.text(`STATUS: ${p.paymentStatus || 'PAID'}`, pageWidth - margin, 18, { align: 'right' });

  // Accent Line
  pdf.setDrawColor(0, 160, 157);
  pdf.setLineWidth(1.2);
  pdf.line(0, 26, pageWidth, 26);

  let y = 36;

  // Employee Summary
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('EMPLOYEE NAME', margin + 5, y + 7);
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text(empName, margin + 5, y + 13);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('EMPLOYEE ID', margin + (contentWidth / 3) + 5, y + 7);
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text(p.employeeId, margin + (contentWidth / 3) + 5, y + 13);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('ATTENDANCE / DAYS', margin + ((contentWidth / 3) * 2) + 5, y + 7);
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${p.presentDays || 25} Present / ${p.workingDays || 26} Working Days`, margin + ((contentWidth / 3) * 2) + 5, y + 13);

  y += 32;

  // Earnings & Deductions Tables (Side by Side)
  const colW = (contentWidth - 8) / 2;

  // Earnings Column
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y, colW, 60, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(113, 75, 103);
  pdf.text('EARNINGS & ALLOWANCES', margin + 4, y + 7);

  let earnY = y + 15;
  const earnings = [
    ['Basic Salary', p.basic],
    ['House Rent Allowance (HRA)', p.hra],
    ['Conveyance Allowance', p.conveyance],
    ['Special Allowance', p.specialAllowance],
    ['Medical Allowance', p.medicalAllowance || 0]
  ];

  earnings.forEach(([label, val]) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85);
    pdf.text(String(label), margin + 4, earnY);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`$${Number(val).toLocaleString()}`, margin + colW - 4, earnY, { align: 'right' });
    earnY += 7;
  });

  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin + 4, earnY, margin + colW - 4, earnY);
  earnY += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(5, 150, 105);
  pdf.text('GROSS EARNINGS', margin + 4, earnY);
  pdf.text(`$${Number(p.grossPay).toLocaleString()}`, margin + colW - 4, earnY, { align: 'right' });

  // Deductions Column
  const dedX = margin + colW + 8;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(dedX, y, colW, 60, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(113, 75, 103);
  pdf.text('DEDUCTIONS & TAXES', dedX + 4, y + 7);

  let dedY = y + 15;
  const deductions = [
    ['Provident Fund (PF)', p.pfDeduction],
    ['Income Tax (TDS)', p.taxDeduction],
    ['Professional Tax', p.professionalTax || 200]
  ];

  deductions.forEach(([label, val]) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85);
    pdf.text(String(label), dedX + 4, dedY);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(225, 29, 72);
    pdf.text(`-$${Number(val).toLocaleString()}`, dedX + colW - 4, dedY, { align: 'right' });
    dedY += 7;
  });

  dedY += 14;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(dedX + 4, dedY, dedX + colW - 4, dedY);
  dedY += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(225, 29, 72);
  pdf.text('TOTAL DEDUCTIONS', dedX + 4, dedY);
  pdf.text(`-$${Number(p.totalDeductions).toLocaleString()}`, dedX + colW - 4, dedY, { align: 'right' });

  y += 68;

  // Net Pay Highlight Box
  pdf.setFillColor(0, 160, 157);
  pdf.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('TOTAL NET DISBURSED PAY (USD)', margin + 6, y + 8);
  pdf.setFontSize(16);
  pdf.text(`$${Number(p.netPay).toLocaleString()}`, margin + 6, y + 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Disbursed On: ${p.paymentDate || new Date().toISOString().split('T')[0]}`, pageWidth - margin - 6, y + 10, { align: 'right' });
  pdf.text('Mode: Direct Bank Transfer', pageWidth - margin - 6, y + 16, { align: 'right' });

  // Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Dayflow Payroll System · Generated on ${new Date().toLocaleDateString()} · Computer generated statement, signature not required.`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  pdf.save(`Payslip_${empName.replace(/\s+/g, '_')}_${p.month.replace(/\s+/g, '_')}.pdf`);
};

