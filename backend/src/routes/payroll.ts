import { Router, Request, Response } from 'express';
import { readDB, writeDB } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/payroll?month=August 2026&employeeId=EMP-XXX
router.get('/', (req: Request, res: Response) => {
  let payroll = readDB<any>('payroll');
  if (req.query.month)       payroll = payroll.filter((p: any) => p.month === req.query.month);
  if (req.query.employeeId)  payroll = payroll.filter((p: any) => p.employeeId === req.query.employeeId);
  res.json({ success: true, data: payroll });
});

// POST /api/payroll/process — bulk payroll run
router.post('/process', (req: Request, res: Response) => {
  const { month } = req.body;
  if (!month) return res.status(400).json({ success: false, message: 'Month is required (e.g. "September 2026")' });

  const users = readDB<any>('users');
  const records = users.map((u: any) => {
    const s = u.salary;
    const grossPay = s.basic + s.hra + s.conveyance + s.specialAllowance + (s.medicalAllowance || 0);
    const totalDeductions = s.pfDeduction + s.taxDeduction + (s.professionalTax || 0);
    return {
      id: `pay-${u.employeeId}-${uuidv4().slice(0, 6)}`,
      employeeId: u.employeeId, employeeName: u.name, month,
      basic: s.basic, hra: s.hra, conveyance: s.conveyance,
      specialAllowance: s.specialAllowance, medicalAllowance: s.medicalAllowance || 0,
      grossPay, pfDeduction: s.pfDeduction, taxDeduction: s.taxDeduction,
      professionalTax: s.professionalTax || 0, totalDeductions, netPay: s.netSalary,
      paymentStatus: 'Paid', paymentDate: new Date().toISOString().split('T')[0],
      workingDays: 26, presentDays: 24,
    };
  });

  const all = readDB<any>('payroll');
  writeDB('payroll', [...records, ...all]);
  res.status(201).json({ success: true, data: records, message: `Payroll for ${month} processed for ${records.length} employees` });
});

export default router;
