import { Router, Request, Response } from 'express';
import { readDB, writeDB, updateOne } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  let leaves = readDB<any>('leaves');
  const { employeeId, status } = req.query;
  if (employeeId) leaves = leaves.filter((l: any) => l.employeeId === String(employeeId));
  if (status)     leaves = leaves.filter((l: any) => l.status === String(status));
  res.json({ success: true, data: leaves });
});

router.post('/', (req: Request, res: Response) => {
  const { employeeId, employeeName, employeeAvatar, employeeDepartment, leaveType, startDate, endDate, reason } = req.body;
  const s = new Date(startDate), e = new Date(endDate);
  const daysCount = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1);

  const leave = {
    id: `lv-${uuidv4()}`, employeeId, employeeName, employeeAvatar, employeeDepartment,
    leaveType, startDate, endDate, daysCount, reason, status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0],
  };
  const all = readDB<any>('leaves');
  all.unshift(leave);
  writeDB('leaves', all);
  res.status(201).json({ success: true, data: leave, message: 'Leave application submitted' });
});

router.put('/:id/review', (req: Request, res: Response) => {
  const { status, adminComments, reviewedBy } = req.body;
  const id = String(req.params.id);
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
  }
  const updated = updateOne<any>('leaves', id, {
    status, adminComments, reviewedBy, reviewedOn: new Date().toISOString().split('T')[0],
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Leave not found' });

  if (status === 'Approved') {
    const users = readDB<any>('users');
    const idx = users.findIndex((u: any) => u.employeeId === updated.employeeId);
    if (idx !== -1) {
      const key = updated.leaveType.toLowerCase() as string;
      const current = users[idx].leaveBalances[key] ?? 0;
      users[idx].leaveBalances[key] = Math.max(0, current - updated.daysCount);
      writeDB('users', users);
    }
  }

  res.json({ success: true, data: updated, message: `Leave ${status.toLowerCase()} successfully` });
});

router.put('/:id/cancel', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const updated = updateOne<any>('leaves', id, { status: 'Cancelled' });
  if (!updated) return res.status(404).json({ success: false, message: 'Leave not found' });
  res.json({ success: true, data: updated, message: 'Leave cancelled' });
});

export default router;
