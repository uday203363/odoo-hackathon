import { Router, Request, Response } from 'express';
import { readDB, writeDB, updateOne, deleteOne } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (_req: Request, res: Response) => res.json({ success: true, data: readDB('departments') }));

router.post('/', (req: Request, res: Response) => {
  const dept = { ...req.body, id: `dept-${uuidv4()}`, createdAt: new Date().toISOString().split('T')[0] };
  const all = readDB<any>('departments'); all.push(dept); writeDB('departments', all);
  res.status(201).json({ success: true, data: dept, message: 'Department created' });
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = updateOne('departments', String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Department not found' });
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req: Request, res: Response) => {
  const ok = deleteOne('departments', String(req.params.id));
  if (!ok) return res.status(404).json({ success: false, message: 'Department not found' });
  res.json({ success: true, message: 'Department deleted' });
});

export default router;
