import { Router, Request, Response } from 'express';
import { readDB, writeDB } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper to generate next sequential Employee ID (e.g. EMP-109)
function generateNextEmpId(): string {
  const users = readDB<any>('users');
  let maxNum = 100;
  for (const u of users) {
    if (u.employeeId && u.employeeId.startsWith('EMP-')) {
      const num = parseInt(u.employeeId.replace('EMP-', ''), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  return `EMP-${maxNum + 1}`;
}

// GET /api/employees
router.get('/', (_req: Request, res: Response) => {
  const users = readDB<any>('users').map(({ password: _pw, ...u }) => u);
  res.json({ success: true, data: users });
});

// POST /api/employees — HR Add New Employee (Default password: join@123)
router.post('/', (req: Request, res: Response) => {
  const {
    name, email, password = 'join@123', designation, departmentId, departmentName,
    phone, address, joinDate, birthDate, role = 'employee', basic = 4000, hra = 1600,
    employeeId: reqEmpId
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and Email are required.' });
  }

  const users = readDB<any>('users');
  const cleanEmail = String(email).trim().toLowerCase();
  const existingEmail = users.find((u: any) => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
  }

  const employeeId = reqEmpId ? String(reqEmpId).trim() : generateNextEmpId();
  const existingEmpId = users.find((u: any) => u.employeeId.toLowerCase() === employeeId.toLowerCase());
  if (existingEmpId) {
    return res.status(400).json({ success: false, message: `An employee with Employee ID '${employeeId}' already exists.` });
  }

  const basicSalary = Number(basic) || 4000;
  const hraSalary = Number(hra) || 1600;
  const conveyance = 400;
  const specialAllowance = 1000;
  const medicalAllowance = 300;
  const grossPay = basicSalary + hraSalary + conveyance + specialAllowance + medicalAllowance;
  const pfDeduction = Math.round(basicSalary * 0.12);
  const taxDeduction = Math.round(grossPay * 0.10);
  const professionalTax = 200;
  const totalDeductions = pfDeduction + taxDeduction + professionalTax;
  const netSalary = grossPay - totalDeductions;

  const newUser = {
    id: `usr-${uuidv4().slice(0, 8)}`,
    employeeId,
    name: String(name).trim(),
    email: cleanEmail,
    password: String(password || 'join@123').trim(),
    role: role || 'employee',
    avatar: `https://images.unsplash.com/photo-${1535713875002 + users.length * 100}?w=150&auto=format&fit=crop&q=80`,
    designation: designation || 'Software Engineer',
    departmentId: departmentId || 'dept-2',
    departmentName: departmentName || 'Engineering',
    phone: phone || '+1 (555) 000-0000',
    address: address || 'San Francisco, CA',
    joinDate: joinDate || new Date().toISOString().split('T')[0],
    birthDate: birthDate || '1995-01-01',
    employmentStatus: 'Active',
    leaveBalances: { paid: 15, sick: 10, unpaid: 0, casual: 5, maternity: 0, paternity: 0 },
    salary: {
      basic: basicSalary, hra: hraSalary, conveyance, specialAllowance, medicalAllowance,
      pfDeduction, taxDeduction, professionalTax, netSalary
    },
    documents: [],
    goals: [],
  };

  users.push(newUser);
  writeDB('users', users);

  // Auto-generate current month payroll entry for new employee
  const currentMonth = 'August 2026';
  const payrollRecords = readDB<any>('payroll');
  const newPayrollRecord = {
    id: `pay-${employeeId}-${uuidv4().slice(0, 6)}`,
    employeeId,
    employeeName: name,
    month: currentMonth,
    basic: basicSalary,
    hra: hraSalary,
    conveyance,
    specialAllowance,
    medicalAllowance,
    grossPay,
    pfDeduction,
    taxDeduction,
    professionalTax,
    totalDeductions,
    netPay: netSalary,
    paymentStatus: 'Paid',
    paymentDate: new Date().toISOString().split('T')[0],
    workingDays: 26,
    presentDays: 25
  };
  payrollRecords.unshift(newPayrollRecord);
  writeDB('payroll', payrollRecords);

  const { password: _pw, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    data: safeUser,
    message: `Employee ${name} added successfully with Employee ID: ${employeeId}`
  });
});

// DELETE /api/employees/:id — Delete employee record
router.delete('/:id', (req: Request, res: Response) => {
  const users = readDB<any>('users');
  const targetId = req.params.id;
  const filtered = users.filter((u: any) => u.id !== targetId && u.employeeId !== targetId);

  if (filtered.length === users.length) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  writeDB('users', filtered);
  res.json({ success: true, message: 'Employee deleted successfully' });
});

// PUT /api/employees/:id/password — Change Password Endpoint
router.put('/:id/password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
  }

  const users = readDB<any>('users');
  const idx = users.findIndex((u: any) => u.id === req.params.id || u.employeeId === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Employee not found' });

  if (currentPassword && users[idx].password !== currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password does not match.' });
  }

  users[idx].password = newPassword;
  writeDB('users', users);
  res.json({ success: true, message: 'Password updated successfully!' });
});

// GET /api/employees/:id
router.get('/:id', (req: Request, res: Response) => {
  const users = readDB<any>('users');
  const user = users.find((u: any) => u.id === req.params.id || u.employeeId === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });
  const { password: _pw, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

// PUT /api/employees/:id — update profile
router.put('/:id', (req: Request, res: Response) => {
  const users = readDB<any>('users');
  const idx = users.findIndex((u: any) => u.id === req.params.id || u.employeeId === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Employee not found' });
  const updated = { ...users[idx], ...req.body, id: users[idx].id, employeeId: users[idx].employeeId };
  users[idx] = updated;
  writeDB('users', updated);
  const { password: _pw, ...safe } = updated;
  res.json({ success: true, data: safe, message: 'Employee updated successfully' });
});

// PUT /api/employees/:id/salary — update salary structure
router.put('/:id/salary', (req: Request, res: Response) => {
  const users = readDB<any>('users');
  const idx = users.findIndex((u: any) => u.id === req.params.id || u.employeeId === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Employee not found' });
  const gross = req.body.basic + req.body.hra + req.body.conveyance + req.body.specialAllowance + (req.body.medicalAllowance || 0);
  const deductions = req.body.pfDeduction + req.body.taxDeduction + (req.body.professionalTax || 0);
  const salary = { ...req.body, netSalary: gross - deductions };
  users[idx] = { ...users[idx], salary };
  writeDB('users', users);
  res.json({ success: true, data: salary, message: 'Salary updated' });
});

// POST /api/employees/:id/goals — add goal
router.post('/:id/goals', (req: Request, res: Response) => {
  const users = readDB<any>('users');
  const idx = users.findIndex((u: any) => u.employeeId === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Employee not found' });
  const goal = { ...req.body, id: `g-${uuidv4()}`, updatedOn: new Date().toISOString().split('T')[0] };
  users[idx].goals = [...(users[idx].goals || []), goal];
  writeDB('users', users);
  res.json({ success: true, data: goal });
});

// PUT /api/employees/:empId/goals/:goalId — update goal progress
router.put('/:empId/goals/:goalId', (req: Request, res: Response) => {
  const users = readDB<any>('users');
  const idx = users.findIndex((u: any) => u.employeeId === String(req.params.empId));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Employee not found' });
  users[idx].goals = (users[idx].goals || []).map((g: any) =>
    g.id === String(req.params.goalId) ? { ...g, ...req.body, updatedOn: new Date().toISOString().split('T')[0] } : g
  );
  writeDB('users', users);
  res.json({ success: true, message: 'Goal updated' });
});

export default router;
