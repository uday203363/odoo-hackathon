import { Router, Request, Response } from 'express';
import { readDB, writeDB, updateOne } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  let tickets = readDB<any>('tickets');
  if (req.query.employeeId) tickets = tickets.filter((t: any) => t.employeeId === String(req.query.employeeId));
  res.json({ success: true, data: tickets });
});

router.post('/', (req: Request, res: Response) => {
  const ticket = {
    id: `tkt-${uuidv4().slice(0, 6)}`,
    ...req.body,
    status: 'Open',
    createdOn: new Date().toISOString().split('T')[0],
    updatedOn: new Date().toISOString().split('T')[0],
  };
  const all = readDB<any>('tickets');
  all.unshift(ticket);
  writeDB('tickets', all);
  res.status(201).json({ success: true, data: ticket, message: 'Ticket created' });
});

router.put('/:id/respond', (req: Request, res: Response) => {
  const { adminResponse, respondedBy, status } = req.body;
  const id = String(req.params.id);
  const updated = updateOne<any>('tickets', id, {
    adminResponse, respondedBy, status,
    updatedOn: new Date().toISOString().split('T')[0],
    resolvedOn: status === 'Resolved' ? new Date().toISOString().split('T')[0] : undefined,
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Ticket not found' });
  res.json({ success: true, data: updated, message: `Ticket ${status.toLowerCase()}` });
});

export default router;
