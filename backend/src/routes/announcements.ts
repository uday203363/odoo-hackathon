import { Router, Request, Response } from 'express';
import { readDB, writeDB, deleteOne } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: readDB('announcements') });
});

router.post('/', (req: Request, res: Response) => {
  const ann = {
    ...req.body,
    id: `ann-${uuidv4()}`,
    postedOn: new Date().toISOString().split('T')[0],
    readBy: [],
  };
  const all = readDB<any>('announcements');
  all.unshift(ann);
  writeDB('announcements', all);
  res.status(201).json({ success: true, data: ann, message: 'Announcement published' });
});

router.put('/:id/read', (req: Request, res: Response) => {
  const { employeeId } = req.body;
  const id = String(req.params.id);
  const all = readDB<any>('announcements');
  const ann = all.find((a: any) => a.id === id);
  if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });

  if (!ann.readBy.includes(employeeId)) {
    ann.readBy.push(employeeId);
    writeDB('announcements', all);
  }
  res.json({ success: true, data: ann });
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const ok = deleteOne('announcements', id);
  if (!ok) return res.status(404).json({ success: false, message: 'Announcement not found' });
  res.json({ success: true, message: 'Announcement deleted' });
});

export default router;
