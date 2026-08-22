import { Router, Request, Response } from 'express';
import { readDB, updateOne } from '../db/db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: readDB('compliance') });
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = updateOne('compliance', String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Compliance item not found' });
  res.json({ success: true, data: updated, message: 'Compliance updated' });
});

export default router;
