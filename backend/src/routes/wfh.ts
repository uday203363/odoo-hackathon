import { Router, Request, Response } from 'express';
import { readDB, writeDB, updateOne } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  let wfh = readDB<any>('wfh');
  if (req.query.employeeId) wfh = wfh.filter((w: any) => w.employeeId === String(req.query.employeeId));
  res.json({ success: true, data: wfh });
});

router.post('/', (req: Request, res: Response) => {
  const request = {
    id: `wfh-${uuidv4()}`, ...req.body, status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0],
  };
  const all = readDB<any>('wfh');
  all.unshift(request);
  writeDB('wfh', all);
  res.status(201).json({ success: true, data: request, message: 'WFH request submitted' });
});

router.put('/:id/review', (req: Request, res: Response) => {
  const { status, adminComments, reviewedBy } = req.body;
  const id = String(req.params.id);
  const updated = updateOne<any>('wfh', id, { status, adminComments, reviewedBy });
  if (!updated) return res.status(404).json({ success: false, message: 'WFH request not found' });
  res.json({ success: true, data: updated, message: `WFH ${status.toLowerCase()}` });
});

export default router;
