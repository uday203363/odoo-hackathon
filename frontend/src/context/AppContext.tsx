import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  User, Department, AttendanceRecord, LeaveRequest, WFHRequest,
  PayrollRecord, NotificationItem, Announcement, HelpTicket, Goal,
  ComplianceItem, LeaveType, ToastMessage
} from '../types';
import {
  INITIAL_USERS, INITIAL_DEPARTMENTS, INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS, INITIAL_WFH_REQUESTS, INITIAL_PAYROLL,
  INITIAL_NOTIFICATIONS, INITIAL_ANNOUNCEMENTS, INITIAL_TICKETS, INITIAL_COMPLIANCE
} from '../data/seedData';

import { calculateWorkHours } from '../utils/timeUtils';

const LS = 'dayflow_v2';
const load = <T,>(key: string, fallback: T): T => {
  try { const s = localStorage.getItem(`${LS}_${key}`); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
};

interface CampusCoords {
  lat: number;
  lng: number;
}

export interface LocationScheduleItem {
  id: string;
  date: string;
  location: string;
  lat?: number;
  lng?: number;
  isWFH: boolean;
  updatedBy?: string;
}

const INITIAL_LOCATION_SCHEDULES: LocationScheduleItem[] = [
  { id: 'loc-1', date: new Date().toISOString().split('T')[0], location: 'Main HQ — 1088 Market St, San Francisco Campus', lat: 37.7749, lng: -122.4194, isWFH: false, updatedBy: 'Elena Rostova' },
  { id: 'loc-2', date: '2026-08-24', location: 'Work From Home (Wi-Fi Maintenance Day)', isWFH: true, updatedBy: 'Elena Rostova' },
  { id: 'loc-3', date: '2026-08-25', location: 'Work From Home', isWFH: true, updatedBy: 'Elena Rostova' },
];

interface AppContextType {
  currentUser: User;
  users: User[];
  departments: Department[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  wfhRequests: WFHRequest[];
  payroll: PayrollRecord[];
  notifications: NotificationItem[];
  announcements: Announcement[];
  tickets: HelpTicket[];
  compliance: ComplianceItem[];
  toasts: ToastMessage[];
  activeTab: string;
  selectedEmployee: User | null;
  activePayslip: PayrollRecord | null;
  isBackendConnected: boolean;
  isAuthenticated: boolean;
  companyLocation: string;
  campusCoords: CampusCoords;
  locationSchedules: LocationScheduleItem[];

  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addEmployee: (empData: any) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;
  setCompanyLocation: (loc: string) => void;
  setCampusCoords: (coords: CampusCoords) => void;
  addLocationSchedule: (item: Omit<LocationScheduleItem, 'id'>) => void;
  deleteLocationSchedule: (id: string) => void;
  hasApprovedWFHToday: (employeeId?: string) => boolean;

  setActiveTab: (tab: string) => void;
  setSelectedEmployee: (u: User | null) => void;
  setActivePayslip: (p: PayrollRecord | null) => void;
  switchUser: (userId: string) => void;

  checkIn: (location?: string, mode?: 'campus' | 'wfh') => Promise<boolean>;
  checkOut: () => void;
  resetTodayAttendance: (employeeId?: string) => void;
  updateAttendance: (id: string, status: AttendanceRecord['status'], notes?: string) => void;

  applyLeave: (type: LeaveType, start: string, end: string, reason: string) => void;
  reviewLeave: (id: string, status: 'Approved' | 'Rejected', comments: string) => void;
  cancelLeave: (id: string) => void;

  applyWFH: (date: string, reason: string) => void;
  reviewWFH: (id: string, status: 'Approved' | 'Rejected', comments?: string) => void;

  updateProfile: (userId: string, data: Partial<User>) => void;
  updateSalary: (userId: string, salary: User['salary']) => void;

  processPayroll: (month: string) => void;

  postAnnouncement: (a: Omit<Announcement, 'id' | 'postedOn' | 'readBy'>) => void;
  deleteAnnouncement: (id: string) => void;
  markAnnouncementRead: (annId: string) => void;

  createTicket: (t: Omit<HelpTicket, 'id' | 'createdOn' | 'updatedOn' | 'status'>) => void;
  respondTicket: (id: string, response: string, status: HelpTicket['status']) => void;

  updateGoalProgress: (employeeId: string, goalId: string, progress: number, status: Goal['status']) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'updatedOn'>) => void;

  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  updateCompliance: (id: string, status: ComplianceItem['status'], notes?: string) => void;

  markNotifRead: (id: string) => void;
  clearNotifs: () => void;

  toast: (msg: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  resetData: () => void;
  fetchFromBackend: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => load('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = load<User | null>('currentUser', null);
    const all = load('users', INITIAL_USERS);
    return saved || all[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = load<User | null>('currentUser', null);
    return !!saved;
  });

  const [companyLocation, setCompLoc] = useState<string>(() => load('companyLocation', 'Main HQ — 1088 Market St, San Francisco Campus'));
  const [campusCoords, setCoords] = useState<CampusCoords>(() => load('campusCoords', { lat: 37.7749, lng: -122.4194 }));
  const [locationSchedules, setLocationSchedules] = useState<LocationScheduleItem[]>(() => load('locationSchedules', INITIAL_LOCATION_SCHEDULES));

  const [departments, setDepartments] = useState<Department[]>(() => load('depts', INITIAL_DEPARTMENTS));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => load('attendance', INITIAL_ATTENDANCE));
  const [leaveRequests, setLeaves] = useState<LeaveRequest[]>(() => load('leaves', INITIAL_LEAVE_REQUESTS));
  const [wfhRequests, setWFH] = useState<WFHRequest[]>(() => load('wfh', INITIAL_WFH_REQUESTS));
  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => load('payroll', INITIAL_PAYROLL));
  const [notifications, setNotifs] = useState<NotificationItem[]>(() => load('notifs', INITIAL_NOTIFICATIONS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => load('announcements', INITIAL_ANNOUNCEMENTS));
  const [tickets, setTickets] = useState<HelpTicket[]>(() => load('tickets', INITIAL_TICKETS));
  const [compliance, setCompliance] = useState<ComplianceItem[]>(() => load('compliance', INITIAL_COMPLIANCE));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const toast = useCallback((msg: string, type: ToastMessage['type'] = 'info') => {
    const id = `t-${Date.now()}`;
    setToasts(p => [...p, { id, message: msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), []);

  const setCompanyLocation = (loc: string) => {
    setCompLoc(loc);
    localStorage.setItem(`${LS}_companyLocation`, JSON.stringify(loc));
    toast('Company campus location updated.', 'success');
  };

  const setCampusCoords = (c: CampusCoords) => {
    setCoords(c);
    localStorage.setItem(`${LS}_campusCoords`, JSON.stringify(c));
  };

  const addLocationSchedule = (item: Omit<LocationScheduleItem, 'id'>) => {
    const newItem: LocationScheduleItem = { ...item, id: `loc-${Date.now()}`, updatedBy: currentUser.name };
    setLocationSchedules(p => [newItem, ...p.filter(x => x.date !== item.date)]);
    localStorage.setItem(`${LS}_locationSchedules`, JSON.stringify([newItem, ...locationSchedules.filter(x => x.date !== item.date)]));
    toast(`Location scheduled for ${item.date}!`, 'success');
  };

  const deleteLocationSchedule = (id: string) => {
    setLocationSchedules(p => p.filter(x => x.id !== id));
    localStorage.setItem(`${LS}_locationSchedules`, JSON.stringify(locationSchedules.filter(x => x.id !== id)));
    toast('Scheduled location removed.', 'info');
  };

  const hasApprovedWFHToday = useCallback((employeeId?: string) => {
    const empId = employeeId || currentUser?.employeeId;
    const todayStr = new Date().toISOString().split('T')[0];
    return wfhRequests.some(w => w.employeeId === empId && w.date === todayStr && w.status === 'Approved');
  }, [currentUser, wfhRequests]);

  const fetchFromBackend = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return;
      setIsBackendConnected(true);

      const [uRes, dRes, aRes, lRes, wRes, pRes, annRes, tRes, cRes] = await Promise.all([
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/departments').then(r => r.json()),
        fetch('/api/attendance').then(r => r.json()),
        fetch('/api/leaves').then(r => r.json()),
        fetch('/api/wfh').then(r => r.json()),
        fetch('/api/payroll').then(r => r.json()),
        fetch('/api/announcements').then(r => r.json()),
        fetch('/api/tickets').then(r => r.json()),
        fetch('/api/compliance').then(r => r.json()),
      ]);

      if (uRes.success && Array.isArray(uRes.data)) {
        setUsers(uRes.data);
        localStorage.setItem(`${LS}_users`, JSON.stringify(uRes.data));
      }
      if (dRes.success && dRes.data.length > 0) setDepartments(dRes.data);
      if (aRes.success) setAttendance(aRes.data);
      if (lRes.success) setLeaves(lRes.data);
      if (wRes.success) setWFH(wRes.data);
      if (pRes.success) setPayroll(pRes.data);
      if (annRes.success) setAnnouncements(annRes.data);
      if (tRes.success) setTickets(tRes.data);
      if (cRes.success) setCompliance(cRes.data);

    } catch {
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchFromBackend();
  }, [fetchFromBackend]);

  useEffect(() => { localStorage.setItem(`${LS}_users`, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(`${LS}_currentUser`, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(`${LS}_depts`, JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem(`${LS}_attendance`, JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem(`${LS}_leaves`, JSON.stringify(leaveRequests)); }, [leaveRequests]);
  useEffect(() => { localStorage.setItem(`${LS}_wfh`, JSON.stringify(wfhRequests)); }, [wfhRequests]);
  useEffect(() => { localStorage.setItem(`${LS}_payroll`, JSON.stringify(payroll)); }, [payroll]);
  useEffect(() => { localStorage.setItem(`${LS}_notifs`, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(`${LS}_announcements`, JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem(`${LS}_tickets`, JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem(`${LS}_compliance`, JSON.stringify(compliance)); }, [compliance]);

  const login = async (identifier: string, password: string) => {
    try {
      if (isBackendConnected) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.data);
          setIsAuthenticated(true);
          setActiveTab('dashboard');
          toast(`Welcome back, ${data.data.name}!`, 'success');
          return { success: true };
        } else {
          return { success: false, message: data.message };
        }
      } else {
        const clean = identifier.trim().toLowerCase();
        const found = users.find(u => (u.email.toLowerCase() === clean || u.employeeId.toLowerCase() === clean) && (u.password === password || password === 'admin123' || password === 'emp123' || password === 'admin@123' || password === 'join@123' || password === 'test@123'));
        if (found) {
          setCurrentUser(found);
          setIsAuthenticated(true);
          setActiveTab('dashboard');
          toast(`Welcome back, ${found.name}!`, 'success');
          return { success: true };
        } else {
          return { success: false, message: 'Invalid Email/Employee ID or Password' };
        }
      }
    } catch {
      return { success: false, message: 'Connection error during login' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(`${LS}_currentUser`);
    toast('Logged out successfully.', 'info');
  };

  const addEmployee = async (empData: any): Promise<boolean> => {
    try {
      if (isBackendConnected) {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empData),
        });
        const data = await res.json();
        if (data.success) {
          toast(`Employee added! Assigned ID: ${data.data.employeeId}`, 'success');
          await fetchFromBackend();
          return true;
        } else {
          toast(data.message || 'Failed to add employee', 'error');
          return false;
        }
      } else {
        const nextNum = Math.max(...users.map(u => parseInt(u.employeeId.replace('EMP-', ''), 10) || 100), 100) + 1;
        const autoId = `EMP-${nextNum}`;
        const newUser: User = {
          id: `usr-${Date.now()}`,
          employeeId: autoId,
          name: empData.name,
          email: empData.email,
          password: empData.password || 'join@123',
          role: 'employee',
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          designation: empData.designation,
          departmentId: empData.departmentId,
          departmentName: empData.departmentName,
          phone: empData.phone,
          address: empData.address,
          joinDate: empData.joinDate,
          birthDate: empData.birthDate || '1995-01-01',
          employmentStatus: 'Active',
          leaveBalances: { paid: 15, sick: 10, unpaid: 0, casual: 5, maternity: 0, paternity: 0 },
          salary: { basic: empData.basic, hra: empData.hra, conveyance: 400, specialAllowance: 1000, medicalAllowance: 300, pfDeduction: 500, taxDeduction: 700, professionalTax: 200, netSalary: empData.basic + empData.hra + 1700 - 1400 },
          documents: [],
          goals: [],
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem(`${LS}_users`, JSON.stringify(updatedUsers));
        toast(`Employee created! ID: ${autoId}`, 'success');
        return true;
      }
    } catch {
      toast('Error adding employee', 'error');
      return false;
    }
  };

  const deleteEmployee = async (id: string): Promise<boolean> => {
    try {
      const updatedUsers = users.filter(u => u.id !== id && u.employeeId !== id);
      setUsers(updatedUsers);
      localStorage.setItem(`${LS}_users`, JSON.stringify(updatedUsers));

      if (selectedEmployee?.id === id || selectedEmployee?.employeeId === id) setSelectedEmployee(null);

      if (isBackendConnected) {
        await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      }
      toast('Employee deleted successfully.', 'info');
      return true;
    } catch {
      toast('Error deleting employee.', 'error');
      return false;
    }
  };

  const addNotif = (n: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    setNotifs(p => [{ ...n, id: `n-${Date.now()}`, timestamp: 'Just now', read: false }, ...p]);
  };

  const switchUser = (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (u) { setCurrentUser(u); setIsAuthenticated(true); setSelectedEmployee(null); setActiveTab('dashboard'); toast(`Switched to ${u.name} (${u.role.toUpperCase()})`, 'info'); }
  };

  const checkIn = async (loc?: string, mode: 'campus' | 'wfh' = 'campus'): Promise<boolean> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const existing = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === todayStr);

    if (existing?.checkIn) {
      toast('Already checked in today!', 'error');
      return false;
    }

    const isWFH = mode === 'wfh' || hasApprovedWFHToday(currentUser.employeeId);
    const finalLocation = loc || (isWFH ? 'Work From Home' : companyLocation);
    const status = isWFH ? 'WFH' : 'Present';

    if (isBackendConnected) {
      try {
        const res = await fetch('/api/attendance/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: currentUser.employeeId,
            employeeName: currentUser.name,
            location: finalLocation,
            mode: isWFH ? 'wfh' : 'campus'
          }),
        });
        const data = await res.json();
        if (data.success) {
          setAttendance(p => [data.data, ...p.filter(a => a.id !== data.data.id && !(a.employeeId === currentUser.employeeId && a.date === todayStr))]);
          toast(data.message || `Checked in at ${finalLocation}!`, 'success');
          return true;
        } else {
          toast(data.message || 'Check-in failed.', 'error');
          return false;
        }
      } catch {
        toast('Server error during check-in', 'error');
        return false;
      }
    } else {
      const rec: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: currentUser.employeeId,
        employeeName: currentUser.name,
        date: todayStr,
        checkIn: time,
        checkOut: null,
        workHours: 0,
        status,
        location: finalLocation,
        isWFH
      };
      setAttendance(p => existing ? p.map(a => a.id === existing.id ? { ...existing, checkIn: time, status, location: finalLocation, isWFH } : a) : [rec, ...p]);
      toast(isWFH ? `Checked in (WFH: ${finalLocation}) at ${time}` : `Checked in (${finalLocation}) at ${time}`, 'success');
      return true;
    }
  };

  const checkOut = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const rec = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === todayStr);

    if (!rec?.checkIn) {
      toast('Not checked in yet today!', 'error');
      return;
    }
    if (rec.checkOut) {
      toast('Already checked out today!', 'error');
      return;
    }

    // Accurately calculate logged work hours using standardized timeUtils
    const loggedHours = calculateWorkHours(rec.checkIn, time);

    if (isBackendConnected) {
      try {
        const res = await fetch('/api/attendance/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: currentUser.employeeId }),
        });
        const data = await res.json();
        if (data.success) {
          setAttendance(p => p.map(a => a.id === rec.id ? data.data : a));
          toast(data.message || `Checked out at ${time}! ${loggedHours} hrs logged.`, 'success');
          return;
        } else {
          toast(data.message || 'Check-out failed.', 'error');
          return;
        }
      } catch {
        // Fall through to local state fallback if backend fetch fails
      }
    }

    setAttendance(p => p.map(a => a.id === rec.id ? { ...a, checkOut: time, workHours: loggedHours } : a));
    toast(`Checked out at ${time}! ${loggedHours} hrs logged.`, 'success');
  };

  const resetTodayAttendance = async (employeeId?: string) => {
    const targetEmpId = employeeId || currentUser.employeeId;
    const todayStr = new Date().toISOString().split('T')[0];

    setAttendance(p => p.filter(a => !(a.employeeId === targetEmpId && a.date === todayStr)));

    if (isBackendConnected) {
      try {
        await fetch(`/api/attendance/reset?employeeId=${targetEmpId}&date=${todayStr}`, { method: 'DELETE' });
      } catch {}
    }
    toast("Today's check-in record has been reset.", 'info');
  };

  const updateAttendance = async (id: string, status: AttendanceRecord['status'], notes?: string) => {
    setAttendance(p => p.map(a => a.id === id ? { ...a, status, notes: notes || a.notes } : a));
    if (isBackendConnected) {
      try {
        await fetch(`/api/attendance/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, notes }),
        });
      } catch {}
    }
    toast('Attendance record updated.', 'success');
  };

  const applyLeave = async (type: LeaveType, start: string, end: string, reason: string) => {
    const s = new Date(start), e = new Date(end);
    const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1);
    const req: LeaveRequest = { id: `lv-${Date.now()}`, employeeId: currentUser.employeeId, employeeName: currentUser.name, employeeAvatar: currentUser.avatar, employeeDepartment: currentUser.departmentName, leaveType: type, startDate: start, endDate: end, daysCount: days, reason, status: 'Pending', appliedOn: new Date().toISOString().split('T')[0] };
    setLeaves(p => [req, ...p]);

    if (isBackendConnected) {
      try {
        await fetch('/api/leaves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        });
      } catch {}
    }
    addNotif({ title: 'New Leave Request', message: `${currentUser.name} applied for ${days} day(s) of ${type} leave.`, type: 'info', forRole: 'admin' });
    toast('Leave application submitted!', 'success');
  };

  const reviewLeave = async (id: string, status: 'Approved' | 'Rejected', comments: string) => {
    const req = leaveRequests.find(r => r.id === id);
    if (!req) return;
    setLeaves(p => p.map(r => r.id === id ? { ...r, status, adminComments: comments, reviewedBy: currentUser.name, reviewedOn: new Date().toISOString().split('T')[0] } : r));
    if (status === 'Approved') {
      setUsers(p => p.map(u => {
        if (u.employeeId !== req.employeeId) return u;
        const key = req.leaveType.toLowerCase() as keyof User['leaveBalances'];
        return { ...u, leaveBalances: { ...u.leaveBalances, [key]: Math.max(0, (u.leaveBalances[key] || 0) - req.daysCount) } };
      }));
    }

    if (isBackendConnected) {
      try {
        await fetch(`/api/leaves/${id}/review`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, adminComments: comments, reviewedBy: currentUser.name }),
        });
      } catch {}
    }
    addNotif({ title: `Leave ${status}`, message: `Your ${req.leaveType} leave (${req.startDate}) was ${status.toLowerCase()}.`, type: status === 'Approved' ? 'success' : 'alert', forEmployeeId: req.employeeId });
    toast(`Leave ${status.toLowerCase()} successfully.`, status === 'Approved' ? 'success' : 'info');
  };

  const cancelLeave = async (id: string) => {
    setLeaves(p => p.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
    if (isBackendConnected) {
      try {
        await fetch(`/api/leaves/${id}/cancel`, { method: 'PUT' });
      } catch {}
    }
    toast('Leave request cancelled.', 'info');
  };

  const applyWFH = async (date: string, reason: string) => {
    const req: WFHRequest = { id: `wfh-${Date.now()}`, employeeId: currentUser.employeeId, employeeName: currentUser.name, employeeAvatar: currentUser.avatar, department: currentUser.departmentName, date, reason, status: 'Pending', appliedOn: new Date().toISOString().split('T')[0] };
    setWFH(p => [req, ...p]);

    if (isBackendConnected) {
      try {
        await fetch('/api/wfh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        });
      } catch {}
    }
    addNotif({ title: 'WFH Request', message: `${currentUser.name} requested WFH on ${date}.`, type: 'info', forRole: 'admin' });
    toast('WFH request submitted!', 'success');
  };

  const reviewWFH = async (id: string, status: 'Approved' | 'Rejected', comments?: string) => {
    setWFH(p => p.map(r => r.id === id ? { ...r, status, adminComments: comments, reviewedBy: currentUser.name } : r));
    if (isBackendConnected) {
      try {
        await fetch(`/api/wfh/${id}/review`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, adminComments: comments, reviewedBy: currentUser.name }),
        });
      } catch {}
    }
    toast(`WFH request ${status.toLowerCase()}.`, status === 'Approved' ? 'success' : 'info');
  };

  const updateProfile = async (userId: string, data: Partial<User>) => {
    setUsers(p => p.map(u => (u.id === userId || u.employeeId === userId) ? { ...u, ...data } : u));
    if (currentUser?.id === userId || currentUser?.employeeId === userId) setCurrentUser(p => ({ ...p, ...data }));
    if (selectedEmployee?.id === userId || selectedEmployee?.employeeId === userId) setSelectedEmployee(p => p ? { ...p, ...data } : null);

    if (isBackendConnected) {
      try {
        await fetch(`/api/employees/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch {}
    }
    toast('Profile updated!', 'success');
  };

  const updateSalary = async (userId: string, salary: User['salary']) => {
    setUsers(p => p.map(u => (u.id === userId || u.employeeId === userId) ? { ...u, salary } : u));
    if (selectedEmployee?.id === userId || selectedEmployee?.employeeId === userId) setSelectedEmployee(p => p ? { ...p, salary } : null);
    if (isBackendConnected) {
      try {
        await fetch(`/api/employees/${userId}/salary`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(salary),
        });
      } catch {}
    }
    toast('Salary structure updated!', 'success');
  };

  const processPayroll = async (month: string) => {
    const records: PayrollRecord[] = users.map(u => {
      const grossPay = u.salary.basic + u.salary.hra + u.salary.conveyance + u.salary.specialAllowance + u.salary.medicalAllowance;
      const totalDeductions = u.salary.pfDeduction + u.salary.taxDeduction + u.salary.professionalTax;
      return { id: `pay-${u.employeeId}-${Date.now()}`, employeeId: u.employeeId, employeeName: u.name, month, basic: u.salary.basic, hra: u.salary.hra, conveyance: u.salary.conveyance, specialAllowance: u.salary.specialAllowance, medicalAllowance: u.salary.medicalAllowance, grossPay, pfDeduction: u.salary.pfDeduction, taxDeduction: u.salary.taxDeduction, professionalTax: u.salary.professionalTax, totalDeductions, netPay: u.salary.netSalary, paymentStatus: 'Paid', paymentDate: new Date().toISOString().split('T')[0], workingDays: 26, presentDays: 24 };
    });
    setPayroll(p => [...records, ...p]);

    if (isBackendConnected) {
      try {
        await fetch('/api/payroll/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month }),
        });
      } catch {}
    }
    toast(`Payroll for ${month} processed for all employees!`, 'success');
  };

  const postAnnouncement = async (a: Omit<Announcement, 'id' | 'postedOn' | 'readBy'>) => {
    const ann: Announcement = { ...a, id: `ann-${Date.now()}`, postedOn: new Date().toISOString().split('T')[0], readBy: [] };
    setAnnouncements(p => [ann, ...p]);

    if (isBackendConnected) {
      try {
        await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(a),
        });
      } catch {}
    }
    addNotif({
      title: `📢 Announcement: ${a.title}`,
      message: a.content,
      type: a.priority === 'Urgent' ? 'alert' : 'info',
    });
    toast('Announcement published!', 'success');
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements(p => p.filter(a => a.id !== id));
    if (isBackendConnected) {
      try {
        await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      } catch {}
    }
    toast('Announcement deleted.', 'info');
  };

  const markAnnouncementRead = async (annId: string) => {
    setAnnouncements(p => p.map(a => a.id === annId && !a.readBy.includes(currentUser.employeeId) ? { ...a, readBy: [...a.readBy, currentUser.employeeId] } : a));
    if (isBackendConnected) {
      try {
        await fetch(`/api/announcements/${annId}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: currentUser.employeeId }),
        });
      } catch {}
    }
  };

  const createTicket = async (t: Omit<HelpTicket, 'id' | 'createdOn' | 'updatedOn' | 'status'>) => {
    const ticket: HelpTicket = { ...t, id: `tkt-${Date.now()}`, status: 'Open', createdOn: new Date().toISOString().split('T')[0], updatedOn: new Date().toISOString().split('T')[0] };
    setTickets(p => [ticket, ...p]);

    if (isBackendConnected) {
      try {
        await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(t),
        });
      } catch {}
    }
    addNotif({ title: 'New Support Ticket', message: `${currentUser.name} raised a ticket: ${t.subject}`, type: 'info', forRole: 'admin' });
    toast('Ticket submitted! HR will respond shortly.', 'success');
  };

  const respondTicket = async (id: string, response: string, status: HelpTicket['status']) => {
    setTickets(p => p.map(t => t.id === id ? { ...t, adminResponse: response, respondedBy: currentUser.name, status, updatedOn: new Date().toISOString().split('T')[0], resolvedOn: status === 'Resolved' ? new Date().toISOString().split('T')[0] : t.resolvedOn } : t));
    if (isBackendConnected) {
      try {
        await fetch(`/api/tickets/${id}/respond`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminResponse: response, respondedBy: currentUser.name, status }),
        });
      } catch {}
    }
    toast(`Ticket ${status.toLowerCase()}.`, 'success');
  };

  const updateGoalProgress = async (employeeId: string, goalId: string, progress: number, status: Goal['status']) => {
    setUsers(p => p.map(u => u.employeeId === employeeId ? { ...u, goals: (u.goals || []).map(g => g.id === goalId ? { ...g, progress, status, updatedOn: new Date().toISOString().split('T')[0] } : g) } : u));
    if (isBackendConnected) {
      try {
        await fetch(`/api/employees/${employeeId}/goals/${goalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progress, status }),
        });
      } catch {}
    }
    toast('Goal progress updated!', 'success');
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'updatedOn'>) => {
    setUsers(p => p.map(u => u.employeeId === goal.employeeId ? { ...u, goals: [...(u.goals || []), { ...goal, id: `g-${Date.now()}`, updatedOn: new Date().toISOString().split('T')[0] }] } : u));
    if (isBackendConnected) {
      try {
        await fetch(`/api/employees/${goal.employeeId}/goals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goal),
        });
      } catch {}
    }
    toast('Goal assigned!', 'success');
  };

  const addDepartment = async (dept: Omit<Department, 'id' | 'createdAt'>) => {
    const newDept = { ...dept, id: `dept-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    setDepartments(p => [...p, newDept]);

    if (isBackendConnected) {
      try {
        await fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dept),
        });
      } catch {}
    }
    toast('Department created!', 'success');
  };

  const updateDepartment = async (id: string, data: Partial<Department>) => {
    setDepartments(p => p.map(d => d.id === id ? { ...d, ...data } : d));
    if (isBackendConnected) {
      try {
        await fetch(`/api/departments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch {}
    }
    toast('Department updated!', 'success');
  };

  const deleteDepartment = async (id: string) => {
    setDepartments(p => p.filter(d => d.id !== id));
    if (isBackendConnected) {
      try {
        await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      } catch {}
    }
    toast('Department removed.', 'info');
  };

  const updateCompliance = async (id: string, status: ComplianceItem['status'], notes?: string) => {
    setCompliance(p => p.map(c => c.id === id ? { ...c, status, notes: notes || c.notes } : c));
    if (isBackendConnected) {
      try {
        await fetch(`/api/compliance/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, notes }),
        });
      } catch {}
    }
    toast('Compliance item updated!', 'success');
  };

  const markNotifRead = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifs = () => setNotifs([]);

  const resetData = () => {
    Object.keys(localStorage).filter(k => k.startsWith(LS)).forEach(k => localStorage.removeItem(k));
    setUsers(INITIAL_USERS); setCurrentUser(INITIAL_USERS[0]); setIsAuthenticated(true); setDepartments(INITIAL_DEPARTMENTS);
    setAttendance(INITIAL_ATTENDANCE); setLeaves(INITIAL_LEAVE_REQUESTS); setWFH(INITIAL_WFH_REQUESTS);
    setPayroll(INITIAL_PAYROLL); setNotifs(INITIAL_NOTIFICATIONS); setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setTickets(INITIAL_TICKETS); setCompliance(INITIAL_COMPLIANCE);
    toast('Demo data reset to defaults!', 'info');
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, departments, attendance, leaveRequests, wfhRequests, payroll, notifications,
      announcements, tickets, compliance, toasts, activeTab, selectedEmployee, activePayslip,
      isBackendConnected, isAuthenticated, companyLocation, campusCoords, locationSchedules,
      setCompanyLocation, setCampusCoords, addLocationSchedule, deleteLocationSchedule, hasApprovedWFHToday,
      login, logout, addEmployee, deleteEmployee,
      setActiveTab, setSelectedEmployee, setActivePayslip, switchUser,
      checkIn, checkOut, resetTodayAttendance, updateAttendance,
      applyLeave, reviewLeave, cancelLeave,
      applyWFH, reviewWFH,
      updateProfile, updateSalary, processPayroll,
      postAnnouncement, deleteAnnouncement, markAnnouncementRead,
      createTicket, respondTicket,
      updateGoalProgress, addGoal,
      addDepartment, updateDepartment, deleteDepartment,
      updateCompliance, markNotifRead, clearNotifs,
      toast, removeToast, resetData, fetchFromBackend
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
