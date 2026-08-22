import { writeDB, isSeeded, readDB } from './db';

const TODAY = new Date().toISOString().split('T')[0];

const USERS = [
  {
    id: 'usr-superadmin', employeeId: 'EMP-00', name: 'Super Admin', email: 'superadmin@dayflow.com',
    password: 'admin@123', role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    designation: 'Chief Technology & Systems Officer', departmentId: 'dept-1', departmentName: 'People & Culture',
    phone: '+1 (555) 000-1111', address: 'Global Headquarters, San Francisco, CA',
    joinDate: '2019-01-01', birthDate: '1980-01-01', managerName: 'Board of Directors',
    bio: 'Super Admin overseeing global HRMS systems, organizational structure, security & compliance.',
    employmentStatus: 'Active', skills: ['System Architecture', 'Global HR', 'Security', 'Compliance'],
    leaveBalances: { paid: 30, sick: 15, unpaid: 0, casual: 10, maternity: 0, paternity: 0 },
    salary: { basic: 10000, hra: 4000, conveyance: 800, specialAllowance: 3000, medicalAllowance: 800, pfDeduction: 1200, taxDeduction: 2000, professionalTax: 200, netSalary: 15200 },
    documents: [],
    goals: [],
  },
  {
    id: 'usr-admin-1', employeeId: 'EMP-001', name: 'Elena Rostova', email: 'hr@dayflow.com',
    password: 'admin@123', role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    designation: 'Head of Human Resources', departmentId: 'dept-1', departmentName: 'People & Culture',
    phone: '+1 (555) 019-2834', address: '742 Evergreen Terrace, San Francisco, CA',
    joinDate: '2021-03-15', birthDate: '1985-07-12', managerName: 'CEO Office',
    bio: 'HR Leader with 10+ years driving organizational culture and agile workforce management.',
    employmentStatus: 'Active', skills: ['HRMS', 'Recruiting', 'Compliance', 'Policy Design'],
    leaveBalances: { paid: 18, sick: 10, unpaid: 0, casual: 6, maternity: 0, paternity: 0 },
    salary: { basic: 6500, hra: 2600, conveyance: 500, specialAllowance: 1400, medicalAllowance: 500, pfDeduction: 780, taxDeduction: 1220, professionalTax: 200, netSalary: 9300 },
    documents: [
      { id: 'doc-101', name: 'Executive_Employment_Agreement.pdf', category: 'Contract', uploadDate: '2021-03-15', expiryDate: '2027-03-15', acknowledged: true },
    ],
    goals: [],
  },
  {
    id: 'usr-emp-1', employeeId: 'EMP-102', name: 'Alex Morgan', email: 'alex.m@dayflow.com',
    password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    designation: 'Senior Full Stack Engineer', departmentId: 'dept-2', departmentName: 'Engineering',
    phone: '+1 (555) 234-5678', address: '1088 Market St, Apt 4B, San Francisco, CA',
    joinDate: '2023-06-01', birthDate: '1992-11-22', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'Passionate software architect crafting scalable microservices and intuitive web interfaces.',
    employmentStatus: 'Active', skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
    leaveBalances: { paid: 12, sick: 7, unpaid: 0, casual: 4, maternity: 0, paternity: 5 },
    salary: { basic: 5200, hra: 2080, conveyance: 400, specialAllowance: 1120, medicalAllowance: 400, pfDeduction: 624, taxDeduction: 976, professionalTax: 200, netSalary: 7400 },
    documents: [],
    goals: [
      { id: 'g-201', employeeId: 'EMP-102', title: 'Microservices Migration', description: 'Migrate legacy monolith to microservices', quarter: 'Q3 2026', dueDate: '2026-09-30', status: 'In Progress', progress: 65, setBy: 'Elena Rostova', updatedOn: '2026-08-10' },
    ],
  },
  {
    id: 'usr-emp-2', employeeId: 'EMP-103', name: 'Sarah Jenkins', email: 'sarah.j@dayflow.com',
    password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    designation: 'Lead Product Designer', departmentId: 'dept-3', departmentName: 'Design',
    phone: '+1 (555) 456-7890', address: '450 Sutter St, San Francisco, CA',
    joinDate: '2022-11-10', birthDate: '1994-03-05', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'UI/UX enthusiast focused on human-centered design systems and accessibility.',
    employmentStatus: 'Active', skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
    leaveBalances: { paid: 15, sick: 9, unpaid: 0, casual: 5, maternity: 12, paternity: 0 },
    salary: { basic: 4800, hra: 1920, conveyance: 400, specialAllowance: 1080, medicalAllowance: 400, pfDeduction: 576, taxDeduction: 824, professionalTax: 200, netSalary: 7000 },
    documents: [],
    goals: [
      { id: 'g-301', employeeId: 'EMP-103', title: 'Design System v2.0', description: 'Launch the new Dayflow design system with dark mode', quarter: 'Q3 2026', dueDate: '2026-09-15', status: 'At Risk', progress: 30, setBy: 'Elena Rostova', updatedOn: '2026-08-12' },
    ],
  },
  {
    id: 'usr-emp-3', employeeId: 'EMP-104', name: 'David Chen', email: 'david.c@dayflow.com',
    password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    designation: 'Financial Analyst', departmentId: 'dept-4', departmentName: 'Finance',
    phone: '+1 (555) 876-5432', address: '320 Montgomery St, San Francisco, CA',
    joinDate: '2024-01-15', birthDate: '1995-08-14', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'Data-driven analyst specializing in corporate forecasting and financial reporting.',
    employmentStatus: 'Probation', probationEndDate: '2024-07-15', skills: ['Excel', 'Power BI', 'SQL', 'Financial Modeling'],
    leaveBalances: { paid: 14, sick: 8, unpaid: 0, casual: 3, maternity: 0, paternity: 5 },
    salary: { basic: 4500, hra: 1800, conveyance: 350, specialAllowance: 950, medicalAllowance: 300, pfDeduction: 540, taxDeduction: 760, professionalTax: 150, netSalary: 6450 },
    documents: [],
    goals: [],
  },
  {
    id: 'usr-emp-4', employeeId: 'EMP-105', name: 'Priya Patel', email: 'priya.p@dayflow.com',
    password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    designation: 'Marketing Manager', departmentId: 'dept-5', departmentName: 'Marketing',
    phone: '+1 (555) 321-9876', address: '1200 Howard St, San Francisco, CA',
    joinDate: '2022-04-20', birthDate: '1990-12-30', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'Growth marketing expert with expertise in brand storytelling and customer acquisition.',
    employmentStatus: 'Active', skills: ['SEO', 'Content Strategy', 'HubSpot', 'Google Ads'],
    leaveBalances: { paid: 16, sick: 10, unpaid: 0, casual: 5, maternity: 0, paternity: 0 },
    salary: { basic: 5000, hra: 2000, conveyance: 400, specialAllowance: 1100, medicalAllowance: 400, pfDeduction: 600, taxDeduction: 900, professionalTax: 200, netSalary: 7200 },
    documents: [],
    goals: [
      { id: 'g-501', employeeId: 'EMP-105', title: 'Q3 Lead Generation', description: 'Drive 500 new qualified leads through digital campaigns', quarter: 'Q3 2026', dueDate: '2026-09-30', status: 'In Progress', progress: 50, setBy: 'Elena Rostova', updatedOn: '2026-08-18' },
    ],
  },
  {
    id: 'usr-emp-5', employeeId: 'EMP-106', name: 'R.Uday kumar reddy', email: 'uday@dayflow.com',
    password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    designation: 'Software Engineer', departmentId: 'dept-2', departmentName: 'Engineering',
    phone: '+1 (555) 987-6543', address: 'San Francisco, CA',
    joinDate: '2024-02-01', birthDate: '1996-05-15', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'Software engineer focused on backend development and React UI application systems.',
    employmentStatus: 'Active', skills: ['React', 'Node.js', 'TypeScript', 'SQL'],
    leaveBalances: { paid: 15, sick: 10, unpaid: 0, casual: 5, maternity: 0, paternity: 0 },
    salary: { basic: 4800, hra: 1920, conveyance: 400, specialAllowance: 1080, medicalAllowance: 400, pfDeduction: 576, taxDeduction: 824, professionalTax: 200, netSalary: 7000 },
    documents: [],
    goals: [],
  },
  {
    id: 'usr-emp-6', employeeId: 'EMP-107', name: 'sagar', email: 'test@example.com',
    password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    designation: 'Software Engineer', departmentId: 'dept-1', departmentName: 'People & Culture',
    phone: '+1 (555) 555-0107', address: 'San Francisco, CA',
    joinDate: '2024-03-01', birthDate: '1997-06-20', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'Software engineer focused on application testing and frontend systems.',
    employmentStatus: 'Active', skills: ['React', 'TypeScript', 'Node.js'],
    leaveBalances: { paid: 15, sick: 10, unpaid: 0, casual: 5, maternity: 0, paternity: 0 },
    salary: { basic: 24000, hra: 9600, conveyance: 400, specialAllowance: 5000, medicalAllowance: 500, pfDeduction: 750, taxDeduction: 500, professionalTax: 200, netSalary: 38050 },
    documents: [],
    goals: [],
  },
  {
    id: 'usr-emp-7', employeeId: 'EMP-108', name: 'Michael Scott', email: 'michael.s@dayflow.com',
    password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    designation: 'Regional Operations Lead', departmentId: 'dept-5', departmentName: 'Marketing',
    phone: '+1 (555) 555-0108', address: 'Scranton / SF Branch, CA',
    joinDate: '2024-03-15', birthDate: '1988-03-15', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'Operations and team manager passionate about workforce culture and team productivity.',
    employmentStatus: 'Active', skills: ['Management', 'Operations', 'Leadership'],
    leaveBalances: { paid: 15, sick: 10, unpaid: 0, casual: 5, maternity: 0, paternity: 0 },
    salary: { basic: 5000, hra: 2000, conveyance: 400, specialAllowance: 1200, medicalAllowance: 400, pfDeduction: 600, taxDeduction: 900, professionalTax: 200, netSalary: 7300 },
    documents: [],
    goals: [],
  },
];

const DEPARTMENTS = [
  { id: 'dept-1', name: 'People & Culture', headId: 'EMP-001', headName: 'Elena Rostova', description: 'HR, recruitment, and employee wellness', color: '#714b67', createdAt: '2020-01-01' },
  { id: 'dept-2', name: 'Engineering', headId: 'EMP-102', headName: 'Alex Morgan', description: 'Software development and architecture', color: '#00a09d', createdAt: '2020-01-01' },
  { id: 'dept-3', name: 'Design', headId: 'EMP-103', headName: 'Sarah Jenkins', description: 'Product design and user experience', color: '#8b5cf6', createdAt: '2020-01-01' },
  { id: 'dept-4', name: 'Finance', headId: 'EMP-104', headName: 'David Chen', description: 'Financial planning and analysis', color: '#f59e0b', createdAt: '2020-01-01' },
  { id: 'dept-5', name: 'Marketing', headId: 'EMP-105', headName: 'Priya Patel', description: 'Brand, campaigns and growth marketing', color: '#ef4444', createdAt: '2021-03-10' },
];

const ATTENDANCE = [
  { id: 'att-t1', employeeId: 'EMP-001', employeeName: 'Elena Rostova', date: TODAY, checkIn: '08:45 AM', checkOut: null, workHours: 0, status: 'Present', location: 'Main HQ' },
  { id: 'att-t2', employeeId: 'EMP-102', employeeName: 'Alex Morgan', date: TODAY, checkIn: '09:00 AM', checkOut: null, workHours: 0, status: 'WFH', isWFH: true, location: 'Remote' },
  { id: 'att-t3', employeeId: 'EMP-103', employeeName: 'Sarah Jenkins', date: TODAY, checkIn: null, checkOut: null, workHours: 0, status: 'Leave', notes: 'Approved Leave' },
  { id: 'att-t4', employeeId: 'EMP-104', employeeName: 'David Chen', date: TODAY, checkIn: '09:35 AM', checkOut: null, workHours: 0, status: 'Late', location: 'Main HQ' },
  { id: 'att-t5', employeeId: 'EMP-105', employeeName: 'Priya Patel', date: TODAY, checkIn: '08:55 AM', checkOut: null, workHours: 0, status: 'Present', location: 'Main HQ' },
  { id: 'att-t6', employeeId: 'EMP-106', employeeName: 'R.Uday kumar reddy', date: TODAY, checkIn: '09:10 AM', checkOut: null, workHours: 0, status: 'Present', location: 'Main HQ' },
  { id: 'att-t7', employeeId: 'EMP-107', employeeName: 'sagar', date: TODAY, checkIn: '09:15 AM', checkOut: null, workHours: 0, status: 'Present', location: 'Main HQ' },
  { id: 'att-t8', employeeId: 'EMP-108', employeeName: 'Michael Scott', date: TODAY, checkIn: '08:50 AM', checkOut: null, workHours: 0, status: 'Present', location: 'Main HQ' },
];

const LEAVES = [
  { id: 'lv-001', employeeId: 'EMP-102', employeeName: 'Alex Morgan', employeeAvatar: USERS[2].avatar, employeeDepartment: 'Engineering', leaveType: 'Paid', startDate: '2026-08-28', endDate: '2026-08-30', daysCount: 3, reason: 'Tech Summit in Austin.', status: 'Pending', appliedOn: '2026-08-20' },
  { id: 'lv-002', employeeId: 'EMP-103', employeeName: 'Sarah Jenkins', employeeAvatar: USERS[3].avatar, employeeDepartment: 'Design', leaveType: 'Paid', startDate: '2026-08-22', endDate: '2026-08-24', daysCount: 3, reason: 'Family vacation.', status: 'Approved', appliedOn: '2026-08-15', adminComments: 'Approved! Have a great trip.', reviewedBy: 'Elena Rostova', reviewedOn: '2026-08-16' },
  { id: 'lv-003', employeeId: 'EMP-104', employeeName: 'David Chen', employeeAvatar: USERS[4].avatar, employeeDepartment: 'Finance', leaveType: 'Sick', startDate: '2026-08-10', endDate: '2026-08-11', daysCount: 2, reason: 'Flu and medical rest.', status: 'Approved', appliedOn: '2026-08-10', adminComments: 'Get well soon!', reviewedBy: 'Elena Rostova', reviewedOn: '2026-08-10' },
  { id: 'lv-004', employeeId: 'EMP-104', employeeName: 'David Chen', employeeAvatar: USERS[4].avatar, employeeDepartment: 'Finance', leaveType: 'Casual', startDate: '2026-09-05', endDate: '2026-09-08', daysCount: 4, reason: 'Apartment relocation.', status: 'Pending', appliedOn: '2026-08-21' },
  { id: 'lv-005', employeeId: 'EMP-106', employeeName: 'R.Uday kumar reddy', employeeAvatar: USERS[5].avatar, employeeDepartment: 'Engineering', leaveType: 'Sick', startDate: '2026-08-26', endDate: '2026-08-27', daysCount: 2, reason: 'health problem', status: 'Cancelled', appliedOn: '2026-08-22' },
];

const WFH = [
  { id: 'wfh-001', employeeId: 'EMP-102', employeeName: 'Alex Morgan', employeeAvatar: USERS[2].avatar, department: 'Engineering', date: TODAY, reason: 'Internet upgrade at office building.', status: 'Approved', appliedOn: '2026-08-21', reviewedBy: 'Elena Rostova' },
  { id: 'wfh-002', employeeId: 'EMP-105', employeeName: 'Priya Patel', employeeAvatar: USERS[4].avatar, department: 'Marketing', date: '2026-08-25', reason: 'Personal errand in morning.', status: 'Pending', appliedOn: '2026-08-22' },
];

const PAYROLL = USERS.map((u, i) => {
  const s = u.salary;
  const grossPay = s.basic + s.hra + s.conveyance + s.specialAllowance + s.medicalAllowance;
  const totalDeductions = s.pfDeduction + s.taxDeduction + s.professionalTax;
  return {
    id: `pay-aug-${i + 1}`, employeeId: u.employeeId, employeeName: u.name, month: 'August 2026',
    basic: s.basic, hra: s.hra, conveyance: s.conveyance, specialAllowance: s.specialAllowance, medicalAllowance: s.medicalAllowance,
    grossPay, pfDeduction: s.pfDeduction, taxDeduction: s.taxDeduction, professionalTax: s.professionalTax,
    totalDeductions, netPay: u.salary.netSalary, paymentStatus: 'Paid', paymentDate: '2026-08-01',
    workingDays: 26, presentDays: [25, 24, 22, 23, 20, 24, 25, 25, 25][i] || 24,
  };
});

const ANNOUNCEMENTS = [
  { id: 'ann-1', title: 'Q3 All-Hands Meeting — September 5th', content: 'Join us for our quarterly all-hands meeting at 2 PM PST. Agenda: OKR review, product roadmap, and employee recognition.', priority: 'Important', postedBy: 'Elena Rostova', postedOn: '2026-08-20', readBy: ['EMP-102', 'EMP-104'], expiresOn: '2026-09-05' },
  { id: 'ann-2', title: 'Office Wi-Fi Maintenance — Aug 24', content: 'IT team will be performing scheduled network maintenance (9AM–12PM). All WFH requests for Aug 24 are pre-approved.', priority: 'Urgent', postedBy: 'Elena Rostova', postedOn: '2026-08-21', readBy: [], expiresOn: '2026-08-24' },
  { id: 'ann-3', title: 'New Mental Health Benefits', content: 'Starting September 1st, all full-time employees are eligible for 6 free therapy sessions per year through Mindful Wellness. Enrollment opens August 25th.', priority: 'Info', postedBy: 'Elena Rostova', postedOn: '2026-08-18', readBy: ['EMP-102', 'EMP-103', 'EMP-105'] },
];

const TICKETS = [
  { id: 'tkt-001', employeeId: 'EMP-102', employeeName: 'Alex Morgan', employeeAvatar: USERS[2].avatar, department: 'Engineering', category: 'IT Request', subject: 'Laptop RAM Upgrade Request', description: 'My laptop has 8GB RAM insufficient for Docker + IDE. Requesting upgrade to 32GB.', status: 'In Progress', priority: 'High', createdOn: '2026-08-18', updatedOn: '2026-08-19', adminResponse: 'IT team has ordered the upgrade. ETA: 3-5 business days.', respondedBy: 'Elena Rostova' },
  { id: 'tkt-002', employeeId: 'EMP-104', employeeName: 'David Chen', employeeAvatar: USERS[4].avatar, department: 'Finance', category: 'Salary Query', subject: 'July Payslip Discrepancy', description: 'My July payslip shows different conveyance allowance than my offer letter.', status: 'Resolved', priority: 'Medium', createdOn: '2026-08-10', updatedOn: '2026-08-12', resolvedOn: '2026-08-12', adminResponse: 'Corrected — one-time transport deduction during July offsite.', respondedBy: 'Elena Rostova' },
  { id: 'tkt-003', employeeId: 'EMP-105', employeeName: 'Priya Patel', employeeAvatar: USERS[5].avatar, department: 'Marketing', category: 'Policy Clarification', subject: 'WFH Policy for Client Visits', description: 'Can I mark attendance as WFH on days I visit clients in a different city?', status: 'Open', priority: 'Low', createdOn: '2026-08-22', updatedOn: '2026-08-22' },
];

const COMPLIANCE = [
  { id: 'cmp-1', employeeId: 'EMP-103', employeeName: 'Sarah Jenkins', type: 'Contract Renewal', dueDate: '2025-11-10', status: 'Overdue', notes: 'Contract expired — renewal pending HR review' },
  { id: 'cmp-2', employeeId: 'EMP-105', employeeName: 'Priya Patel', type: 'Contract Renewal', dueDate: '2025-04-20', status: 'Overdue', notes: 'Month-to-month basis until renewal finalized' },
  { id: 'cmp-3', employeeId: 'EMP-104', employeeName: 'David Chen', type: 'Probation End', dueDate: '2024-07-15', status: 'Done', notes: 'Successfully passed probation. Confirmed.' },
  { id: 'cmp-4', employeeId: 'EMP-104', employeeName: 'David Chen', type: 'Policy Acknowledgement', dueDate: '2026-08-30', status: 'Pending', notes: 'Code of Conduct (2026 edition) awaiting signature' },
];

export function seedAll() {
  // Only seed if users.json does not exist or is uninitialized!
  if (isSeeded('users')) {
    console.log('📦 Database files exist. Preserving dynamic user database without re-seeding.');
    return;
  }

  writeDB('users', USERS);
  writeDB('departments', DEPARTMENTS);
  writeDB('attendance', ATTENDANCE);
  writeDB('leaves', LEAVES);
  writeDB('wfh', WFH);
  writeDB('payroll', PAYROLL);
  writeDB('announcements', ANNOUNCEMENTS);
  writeDB('tickets', TICKETS);
  writeDB('compliance', COMPLIANCE);
  console.log('✅ Initial database seed completed.');
}
