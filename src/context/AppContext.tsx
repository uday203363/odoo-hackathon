import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AttendanceRecord, LeaveRequest, PayrollRecord, NotificationItem, LeaveType } from '../types';
import { INITIAL_USERS, INITIAL_ATTENDANCE, INITIAL_LEAVE_REQUESTS, INITIAL_PAYROLL, INITIAL_NOTIFICATIONS } from '../data/seedData';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User;
  users: User[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payroll: PayrollRecord[];
  notifications: NotificationItem[];
  toasts: ToastState[];
  currentTab: string;
  selectedEmployeeForView: User | null;
  activePayslip: PayrollRecord | null;
  
  // Actions
  switchUser: (userId: string) => void;
  setCurrentTab: (tab: string) => void;
  setSelectedEmployeeForView: (user: User | null) => void;
  setActivePayslip: (payroll: PayrollRecord | null) => void;
  
  // Attendance actions
  checkInUser: (location?: string, notes?: string) => void;
  checkOutUser: () => void;
  updateAttendanceStatus: (recordId: string, status: AttendanceRecord['status'], notes?: string) => void;
  
  // Leave actions
  applyLeave: (leaveType: LeaveType, startDate: string, endDate: string, reason: string) => void;
  reviewLeaveRequest: (requestId: string, status: 'Approved' | 'Rejected', adminComments: string) => void;
  
  // Profile actions
  updateUserProfile: (userId: string, updatedData: Partial<User>) => void;
  
  // Payroll actions
  updateEmployeeSalary: (userId: string, salary: User['salary']) => void;
  processMonthlyPayroll: (month: string) => void;
  
  // Toast & Notifications
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string) => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dayflow_hrms_v1_state';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem(`${LOCAL_STORAGE_KEY}_currentUser`);
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const exists = users.find(u => u.id === parsed.id);
      if (exists) return exists;
    }
    return users[0]; // Admin by default
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_leaveRequests`);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_payroll`);
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState<User | null>(null);
  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_leaveRequests`, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_payroll`, JSON.stringify(payroll));
  }, [payroll]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setSelectedEmployeeForView(null);
      addToast(`Switched view to ${target.name} (${target.role.toUpperCase()})`, 'info');
    }
  };

  // Check in
  const checkInUser = (location = 'Office', notes = '') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if already checked in today
    const existing = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === todayStr);

    if (existing && existing.checkIn) {
      addToast('You are already checked in for today!', 'error');
      return;
    }

    let newRecord: AttendanceRecord;
    if (existing) {
      newRecord = {
        ...existing,
        checkIn: timeStr,
        status: 'Present',
        location,
        notes: notes || existing.notes,
      };
      setAttendance(prev => prev.map(a => a.id === existing.id ? newRecord : a));
    } else {
      newRecord = {
        id: `att-${Date.now()}`,
        employeeId: currentUser.employeeId,
        employeeName: currentUser.name,
        date: todayStr,
        checkIn: timeStr,
        checkOut: null,
        workHours: 0,
        status: 'Present',
        location,
        notes,
      };
      setAttendance(prev => [newRecord, ...prev]);
    }

    addToast(`Successfully checked in at ${timeStr}`, 'success');
  };

  // Check out
  const checkOutUser = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const existing = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === todayStr);

    if (!existing || !existing.checkIn) {
      addToast('You have not checked in today yet!', 'error');
      return;
    }

    if (existing.checkOut) {
      addToast('You have already checked out today!', 'error');
      return;
    }

    // Calculate approx work hours
    const hours = 8.0; // Default full standard shift day

    const updated: AttendanceRecord = {
      ...existing,
      checkOut: timeStr,
      workHours: hours,
    };

    setAttendance(prev => prev.map(a => a.id === existing.id ? updated : a));
    addToast(`Checked out at ${timeStr}. Total work time logged.`, 'success');
  };

  const updateAttendanceStatus = (recordId: string, status: AttendanceRecord['status'], notes?: string) => {
    setAttendance(prev => prev.map(a => {
      if (a.id === recordId) {
        return { ...a, status, notes: notes || a.notes };
      }
      return a;
    }));
    addToast('Attendance record updated by HR', 'success');
  };

  // Apply Leave
  const applyLeave = (leaveType: LeaveType, startDate: string, endDate: string, reason: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: `lv-${Date.now()}`,
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      employeeAvatar: currentUser.avatar,
      employeeDepartment: currentUser.department,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests(prev => [newRequest, ...prev]);

    // Create notification for admin
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Leave Application',
      message: `${currentUser.name} applied for ${daysCount} day(s) of ${leaveType} leave.`,
      timestamp: 'Just now',
      read: false,
      type: 'info',
      forRole: 'admin',
    };
    setNotifications(prev => [newNotif, ...prev]);

    addToast(`Leave application for ${daysCount} day(s) submitted successfully`, 'success');
  };

  // Approve / Reject Leave
  const reviewLeaveRequest = (requestId: string, status: 'Approved' | 'Rejected', adminComments: string) => {
    const req = leaveRequests.find(r => r.id === requestId);
    if (!req) return;

    const updated: LeaveRequest = {
      ...req,
      status,
      adminComments,
      reviewedBy: currentUser.name,
      reviewedOn: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests(prev => prev.map(r => r.id === requestId ? updated : r));

    // Update employee leave balance if approved
    if (status === 'Approved') {
      setUsers(prev => prev.map(u => {
        if (u.employeeId === req.employeeId) {
          const key = req.leaveType.toLowerCase() as keyof User['leaveBalances'];
          const currentBal = u.leaveBalances[key] || 0;
          return {
            ...u,
            leaveBalances: {
              ...u.leaveBalances,
              [key]: Math.max(0, currentBal - req.daysCount),
            },
          };
        }
        return u;
      }));

      // Also create an attendance record for the leave dates
      const newAtt: AttendanceRecord = {
        id: `att-lv-${Date.now()}`,
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        date: req.startDate,
        checkIn: null,
        checkOut: null,
        workHours: 0,
        status: 'Leave',
        notes: `Approved ${req.leaveType} Leave: ${req.reason}`,
      };
      setAttendance(prev => [newAtt, ...prev]);
    }

    // Send notification to employee
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Leave ${status}`,
      message: `Your ${req.leaveType} leave request (${req.startDate} to ${req.endDate}) was ${status.toLowerCase()} by HR.`,
      timestamp: 'Just now',
      read: false,
      type: status === 'Approved' ? 'success' : 'alert',
      forEmployeeId: req.employeeId,
    };
    setNotifications(prev => [newNotif, ...prev]);

    addToast(`Leave request ${status.toLowerCase()} successfully`, status === 'Approved' ? 'success' : 'info');
  };

  const updateUserProfile = (userId: string, updatedData: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...updatedData };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
    addToast('Profile updated successfully!', 'success');
  };

  const updateEmployeeSalary = (userId: string, salary: User['salary']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, salary } : u));
    addToast('Salary structure updated successfully!', 'success');
  };

  const processMonthlyPayroll = (month: string) => {
    const newRecords: PayrollRecord[] = users.map(u => {
      const grossPay = u.salary.basic + u.salary.hra + u.salary.conveyance + u.salary.specialAllowance;
      const netPay = grossPay - u.salary.pfDeduction - u.salary.taxDeduction;

      return {
        id: `pay-${u.employeeId}-${Date.now()}`,
        employeeId: u.employeeId,
        employeeName: u.name,
        month,
        basic: u.salary.basic,
        hra: u.salary.hra,
        conveyance: u.salary.conveyance,
        specialAllowance: u.salary.specialAllowance,
        grossPay,
        pfDeduction: u.salary.pfDeduction,
        taxDeduction: u.salary.taxDeduction,
        netPay,
        paymentStatus: 'Paid',
        paymentDate: new Date().toISOString().split('T')[0],
      };
    });

    setPayroll(prev => [...newRecords, ...prev]);
    addToast(`Monthly payroll for ${month} processed successfully for all employees!`, 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setPayroll(INITIAL_PAYROLL);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.clear();
    addToast('Application state reset to demo defaults!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        attendance,
        leaveRequests,
        payroll,
        notifications,
        toasts,
        currentTab,
        selectedEmployeeForView,
        activePayslip,
        switchUser,
        setCurrentTab,
        setSelectedEmployeeForView,
        setActivePayslip,
        checkInUser,
        checkOutUser,
        updateAttendanceStatus,
        applyLeave,
        reviewLeaveRequest,
        updateUserProfile,
        updateEmployeeSalary,
        processMonthlyPayroll,
        addToast,
        removeToast,
        markNotificationRead,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
