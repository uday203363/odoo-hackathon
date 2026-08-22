export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  designation: string;
  department: string;
  phone: string;
  address: string;
  joinDate: string;
  managerName?: string;
  bio?: string;
  leaveBalances: {
    paid: number;
    sick: number;
    unpaid: number;
    casual: number;
  };
  salary: {
    basic: number;
    hra: number;
    conveyance: number;
    specialAllowance: number;
    pfDeduction: number;
    taxDeduction: number;
    netSalary: number;
  };
  documents: {
    id: string;
    name: string;
    category: 'Contract' | 'ID Proof' | 'Tax Form' | 'Certificate';
    uploadDate: string;
    fileUrl?: string;
  }[];
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave' | 'Late';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // e.g. "09:02 AM"
  checkOut: string | null; // e.g. "05:30 PM"
  workHours: number; // e.g. 8.5
  status: AttendanceStatus;
  notes?: string;
  location?: string;
}

export type LeaveType = 'Paid' | 'Sick' | 'Unpaid' | 'Casual';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  employeeDepartment: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  adminComments?: string;
  reviewedBy?: string;
  reviewedOn?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g. "August 2026"
  basic: number;
  hra: number;
  conveyance: number;
  specialAllowance: number;
  grossPay: number;
  pfDeduction: number;
  taxDeduction: number;
  netPay: number;
  paymentStatus: 'Paid' | 'Processing' | 'Pending';
  paymentDate?: string;
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
}
