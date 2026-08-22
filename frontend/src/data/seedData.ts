import type {
  User, Department, AttendanceRecord, LeaveRequest, WFHRequest,
  PayrollRecord, NotificationItem, Announcement, HelpTicket, ComplianceItem
} from '../types';

// ─────────────────────── DEPARTMENTS ────────────────────────
export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'People & Culture', headId: 'EMP-001', headName: 'Elena Rostova', description: 'HR, recruitment, and employee wellness', color: '#714b67', createdAt: '2020-01-01' },
  { id: 'dept-2', name: 'Engineering',       headId: 'EMP-102', headName: 'Alex Morgan',   description: 'Software development and architecture',  color: '#00a09d', createdAt: '2020-01-01' },
  { id: 'dept-3', name: 'Design',            headId: 'EMP-103', headName: 'Sarah Jenkins', description: 'Product design and user experience',       color: '#8b5cf6', createdAt: '2020-01-01' },
  { id: 'dept-4', name: 'Finance',           headId: 'EMP-104', headName: 'David Chen',    description: 'Financial planning and analysis',          color: '#f59e0b', createdAt: '2020-01-01' },
  { id: 'dept-5', name: 'Marketing',         headId: 'EMP-105', headName: 'Priya Patel',   description: 'Brand, campaigns and growth marketing',    color: '#ef4444', createdAt: '2021-03-10' },
];

// ─────────────────────── USERS ───────────────────────────────
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1', employeeId: 'EMP-001', name: 'Elena Rostova', email: 'hr@dayflow.com', password: 'admin@123', role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    designation: 'Head of Human Resources', departmentId: 'dept-1', departmentName: 'People & Culture',
    phone: '+1 (555) 019-2834', address: '742 Evergreen Terrace, San Francisco, CA',
    joinDate: '2021-03-15', birthDate: '1985-07-12', managerName: 'CEO Office',
    bio: 'HR Leader with 10+ years driving organizational culture, employee wellness, and agile workforce management.',
    employmentStatus: 'Active', skills: ['HRMS', 'Recruiting', 'Compliance', 'Policy Design'],
    leaveBalances: { paid: 18, sick: 10, unpaid: 0, casual: 6, maternity: 0, paternity: 0 },
    salary: { basic: 6500, hra: 2600, conveyance: 500, specialAllowance: 1400, medicalAllowance: 500, pfDeduction: 780, taxDeduction: 1220, professionalTax: 200, netSalary: 9300 },
    documents: [
      { id: 'doc-101', name: 'Executive_Employment_Agreement.pdf', category: 'Contract', uploadDate: '2021-03-15', expiryDate: '2027-03-15', acknowledged: true },
    ],
  },
  {
    id: 'usr-emp-1', employeeId: 'EMP-102', name: 'Alex Morgan', email: 'alex.m@dayflow.com', password: 'join@123', role: 'employee',
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
      { id: 'g-201', employeeId: 'EMP-102', title: 'Complete Microservices Migration', description: 'Migrate legacy monolith to microservices by end of Q3', quarter: 'Q3 2026', dueDate: '2026-09-30', status: 'In Progress', progress: 65, setBy: 'Elena Rostova', updatedOn: '2026-08-10' },
    ],
  },
  {
    id: 'usr-emp-2', employeeId: 'EMP-103', name: 'Sarah Jenkins', email: 'sarah.j@dayflow.com', password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    designation: 'Lead Product Designer', departmentId: 'dept-3', departmentName: 'Design',
    phone: '+1 (555) 456-7890', address: '450 Sutter St, San Francisco, CA',
    joinDate: '2022-11-10', birthDate: '1994-03-05', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'UI/UX enthusiast focused on human-centered design systems and digital product accessibility.',
    employmentStatus: 'Active', skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
    leaveBalances: { paid: 15, sick: 9, unpaid: 0, casual: 5, maternity: 12, paternity: 0 },
    salary: { basic: 4800, hra: 1920, conveyance: 400, specialAllowance: 1080, medicalAllowance: 400, pfDeduction: 576, taxDeduction: 824, professionalTax: 200, netSalary: 7000 },
    documents: [],
    goals: [
      { id: 'g-301', employeeId: 'EMP-103', title: 'Design System v2.0', description: 'Launch the new Dayflow design system with dark mode support', quarter: 'Q3 2026', dueDate: '2026-09-15', status: 'At Risk', progress: 30, setBy: 'Elena Rostova', updatedOn: '2026-08-12' },
    ],
  },
  {
    id: 'usr-emp-3', employeeId: 'EMP-104', name: 'David Chen', email: 'david.c@dayflow.com', password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    designation: 'Financial Analyst', departmentId: 'dept-4', departmentName: 'Finance',
    phone: '+1 (555) 876-5432', address: '320 Montgomery St, San Francisco, CA',
    joinDate: '2024-01-15', birthDate: '1995-08-14', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'Data-driven analyst specializing in corporate forecasting, budget planning, and financial reporting.',
    employmentStatus: 'Probation', probationEndDate: '2024-07-15', skills: ['Excel', 'Power BI', 'SQL', 'Financial Modeling'],
    leaveBalances: { paid: 14, sick: 8, unpaid: 0, casual: 3, maternity: 0, paternity: 5 },
    salary: { basic: 4500, hra: 1800, conveyance: 350, specialAllowance: 950, medicalAllowance: 300, pfDeduction: 540, taxDeduction: 760, professionalTax: 150, netSalary: 6450 },
    documents: [],
    goals: [],
  },
  {
    id: 'usr-emp-4', employeeId: 'EMP-105', name: 'Priya Patel', email: 'priya.p@dayflow.com', password: 'join@123', role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    designation: 'Marketing Manager', departmentId: 'dept-5', departmentName: 'Marketing',
    phone: '+1 (555) 321-9876', address: '1200 Howard St, San Francisco, CA',
    joinDate: '2022-04-20', birthDate: '1990-12-30', managerId: 'EMP-001', managerName: 'Elena Rostova',
    bio: 'Growth marketing expert with expertise in brand storytelling, digital campaigns and customer acquisition.',
    employmentStatus: 'Active', skills: ['SEO', 'Content Strategy', 'HubSpot', 'Google Ads', 'Analytics'],
    leaveBalances: { paid: 16, sick: 10, unpaid: 0, casual: 5, maternity: 0, paternity: 0 },
    salary: { basic: 5000, hra: 2000, conveyance: 400, specialAllowance: 1100, medicalAllowance: 400, pfDeduction: 600, taxDeduction: 900, professionalTax: 200, netSalary: 7200 },
    documents: [],
    goals: [
      { id: 'g-501', employeeId: 'EMP-105', title: 'Q3 Lead Generation Campaign', description: 'Drive 500 new qualified leads through digital campaigns', quarter: 'Q3 2026', dueDate: '2026-09-30', status: 'In Progress', progress: 50, setBy: 'Elena Rostova', updatedOn: '2026-08-18' },
    ],
  },
];

const T = new Date().toISOString().split('T')[0];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-t1', employeeId: 'EMP-001', employeeName: 'Elena Rostova', date: T, checkIn: '08:45 AM', checkOut: null, workHours: 0, status: 'Present', location: 'Main HQ' },
  { id: 'att-t2', employeeId: 'EMP-102', employeeName: 'Alex Morgan',   date: T, checkIn: '09:00 AM', checkOut: null, workHours: 0, status: 'WFH', isWFH: true, location: 'Remote' },
  { id: 'att-t3', employeeId: 'EMP-103', employeeName: 'Sarah Jenkins', date: T, checkIn: null, checkOut: null, workHours: 0, status: 'Leave', notes: 'Approved Paid Leave' },
  { id: 'att-t4', employeeId: 'EMP-104', employeeName: 'David Chen',    date: T, checkIn: '09:35 AM', checkOut: null, workHours: 0, status: 'Late', location: 'Main HQ', notes: 'Traffic delay' },
  { id: 'att-t5', employeeId: 'EMP-105', employeeName: 'Priya Patel',   date: T, checkIn: '08:55 AM', checkOut: null, workHours: 0, status: 'Present', location: 'Main HQ' },
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'lv-001', employeeId: 'EMP-102', employeeName: 'Alex Morgan', employeeAvatar: INITIAL_USERS[1].avatar, employeeDepartment: 'Engineering', leaveType: 'Paid', startDate: '2026-08-28', endDate: '2026-08-30', daysCount: 3, reason: 'Tech Summit in Austin.', status: 'Pending', appliedOn: '2026-08-20' },
  { id: 'lv-002', employeeId: 'EMP-103', employeeName: 'Sarah Jenkins', employeeAvatar: INITIAL_USERS[2].avatar, employeeDepartment: 'Design', leaveType: 'Paid', startDate: '2026-08-22', endDate: '2026-08-24', daysCount: 3, reason: 'Family vacation.', status: 'Approved', appliedOn: '2026-08-15', adminComments: 'Approved! Have a great trip.', reviewedBy: 'Elena Rostova', reviewedOn: '2026-08-16' },
  { id: 'lv-003', employeeId: 'EMP-104', employeeName: 'David Chen', employeeAvatar: INITIAL_USERS[3].avatar, employeeDepartment: 'Finance', leaveType: 'Sick', startDate: '2026-08-10', endDate: '2026-08-11', daysCount: 2, reason: 'Flu and medical rest.', status: 'Approved', appliedOn: '2026-08-10', adminComments: 'Get well soon!', reviewedBy: 'Elena Rostova', reviewedOn: '2026-08-10' },
];

export const INITIAL_WFH_REQUESTS: WFHRequest[] = [
  { id: 'wfh-001', employeeId: 'EMP-102', employeeName: 'Alex Morgan', employeeAvatar: INITIAL_USERS[1].avatar, department: 'Engineering', date: T, reason: 'Internet upgrade at office building.', status: 'Approved', appliedOn: '2026-08-21', reviewedBy: 'Elena Rostova' },
];

export const INITIAL_PAYROLL: PayrollRecord[] = INITIAL_USERS.map((u, i) => {
  const grossPay = u.salary.basic + u.salary.hra + u.salary.conveyance + u.salary.specialAllowance + u.salary.medicalAllowance;
  const totalDeductions = u.salary.pfDeduction + u.salary.taxDeduction + u.salary.professionalTax;
  return {
    id: `pay-aug-${i + 1}`, employeeId: u.employeeId, employeeName: u.name, month: 'August 2026',
    basic: u.salary.basic, hra: u.salary.hra, conveyance: u.salary.conveyance, specialAllowance: u.salary.specialAllowance, medicalAllowance: u.salary.medicalAllowance,
    grossPay, pfDeduction: u.salary.pfDeduction, taxDeduction: u.salary.taxDeduction, professionalTax: u.salary.professionalTax,
    totalDeductions, netPay: u.salary.netSalary, paymentStatus: 'Paid', paymentDate: '2026-08-01',
    workingDays: 26, presentDays: [24, 22, 23, 20, 24][i],
  };
});

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'New Leave Request', message: 'Alex Morgan applied for 3-day Paid Leave (Aug 28-30).', timestamp: '10 mins ago', read: false, type: 'info', forRole: 'admin' },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann-1', title: 'Q3 All-Hands Meeting — September 5th', content: 'Join us for our quarterly all-hands meeting at 2 PM PST. Agenda: OKR review, product roadmap, and employee recognition awards.', priority: 'Important', postedBy: 'Elena Rostova', postedOn: '2026-08-20', readBy: ['EMP-102', 'EMP-104'], expiresOn: '2026-09-05' },
];

export const INITIAL_TICKETS: HelpTicket[] = [
  { id: 'tkt-001', employeeId: 'EMP-102', employeeName: 'Alex Morgan', employeeAvatar: INITIAL_USERS[1].avatar, department: 'Engineering', category: 'IT Request', subject: 'Laptop RAM Upgrade Request', description: 'Requesting upgrade to 32GB RAM.', status: 'In Progress', priority: 'High', createdOn: '2026-08-18', updatedOn: '2026-08-19' },
];

export const INITIAL_COMPLIANCE: ComplianceItem[] = [
  { id: 'cmp-1', employeeId: 'EMP-103', employeeName: 'Sarah Jenkins', type: 'Contract Renewal', dueDate: '2025-11-10', status: 'Overdue', notes: 'Contract expired — renewal pending HR review' },
];
