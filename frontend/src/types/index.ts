// ============================================================
// Dayflow HRMS — Full TypeScript Type Definitions
// ============================================================

export type UserRole = 'super_admin' | 'hr' | 'admin' | 'employee';
export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave' | 'Late' | 'WFH';
export type LeaveType = 'Paid' | 'Sick' | 'Unpaid' | 'Casual' | 'Maternity' | 'Paternity';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketCategory = 'Salary Query' | 'IT Request' | 'Policy Clarification' | 'Leave Issue' | 'Payroll Error' | 'Other';
export type AnnouncementPriority = 'Info' | 'Important' | 'Urgent';
export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed' | 'At Risk';
export type EmploymentStatus = 'Active' | 'Probation' | 'Notice Period' | 'Inactive';

export interface Department {
  id: string;
  name: string;
  headId: string;
  headName: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface SalaryStructure {
  basic: number;
  hra: number;
  conveyance: number;
  specialAllowance: number;
  medicalAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  professionalTax: number;
  netSalary: number;
}

export interface Document {
  id: string;
  name: string;
  category: 'Contract' | 'ID Proof' | 'Tax Form' | 'Certificate' | 'Policy';
  uploadDate: string;
  expiryDate?: string;
  acknowledged?: boolean;
  fileData?: string;
  fileSize?: string;
  uploadedBy?: string;
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  phone: string;
  address: string;
  joinDate: string;
  birthDate?: string;
  managerId?: string;
  managerName?: string;
  bio?: string;
  employmentStatus: EmploymentStatus;
  probationEndDate?: string;
  contractEndDate?: string;
  skills?: string[];
  leaveBalances: {
    paid: number;
    sick: number;
    unpaid: number;
    casual: number;
    maternity: number;
    paternity: number;
  };
  salary: SalaryStructure;
  documents: Document[];
  goals?: Goal[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  status: AttendanceStatus;
  notes?: string;
  location?: string;
  isWFH?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  employeeDepartment: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  adminComments?: string;
  reviewedBy?: string;
  reviewedOn?: string;
}

export interface WFHRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  adminComments?: string;
  reviewedBy?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basic: number;
  hra: number;
  conveyance: number;
  specialAllowance: number;
  medicalAllowance: number;
  grossPay: number;
  pfDeduction: number;
  taxDeduction: number;
  professionalTax: number;
  totalDeductions: number;
  netPay: number;
  paymentStatus: 'Paid' | 'Processing' | 'Pending';
  paymentDate?: string;
  workingDays: number;
  presentDays: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  forRole?: UserRole;
  forEmployeeId?: string;
  link?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  postedBy: string;
  postedOn: string;
  readBy: string[];
  targetDepartment?: string;
  expiresOn?: string;
}

export interface HelpTicket {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: 'Low' | 'Medium' | 'High';
  createdOn: string;
  updatedOn: string;
  resolvedOn?: string;
  adminResponse?: string;
  respondedBy?: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  quarter: string;
  dueDate: string;
  status: GoalStatus;
  progress: number;
  setBy: string;
  updatedOn: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface ComplianceItem {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Contract Renewal' | 'Probation End' | 'Policy Acknowledgement';
  dueDate: string;
  status: 'Pending' | 'Done' | 'Overdue';
  notes?: string;
}
