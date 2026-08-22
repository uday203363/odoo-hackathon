import { Router, Request, Response } from 'express';
import { readDB } from '../db/db';

const router = Router();

// GET /api/auth/users — list all users for demo login switcher
router.get('/users', (_req: Request, res: Response) => {
  const users = readDB<any>('users').map(u => ({
    id: u.id, employeeId: u.employeeId, name: u.name,
    email: u.email, role: u.role, avatar: u.avatar,
    designation: u.designation, departmentId: u.departmentId,
    departmentName: u.departmentName, phone: u.phone, address: u.address,
    joinDate: u.joinDate, birthDate: u.birthDate, managerName: u.managerName,
    managerId: u.managerId, bio: u.bio, employmentStatus: u.employmentStatus,
    probationEndDate: u.probationEndDate, contractEndDate: u.contractEndDate,
    skills: u.skills, leaveBalances: u.leaveBalances, salary: u.salary,
    documents: u.documents, goals: u.goals,
  }));
  res.json({ success: true, data: users });
});

// POST /api/auth/login — supports Email OR Employee ID + Password
router.post('/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide Email/Employee ID and Password' });
  }

  const users = readDB<any>('users');
  const cleanId = String(identifier).trim().toLowerCase();
  
  const user = users.find((u: any) => 
    (u.email.toLowerCase() === cleanId || u.employeeId.toLowerCase() === cleanId) &&
    u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Please check Email/Employee ID and password.' });
  }

  const { password: _pw, ...safeUser } = user;
  res.json({ success: true, data: safeUser, message: `Welcome back, ${user.name}!` });
});

export default router;
