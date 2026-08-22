import { Router, Request, Response } from 'express';
import { readDB, writeDB, updateOne } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/attendance?date=YYYY-MM-DD&employeeId=EMP-XXX
router.get('/', (req: Request, res: Response) => {
  let records = readDB<any>('attendance');
  const { date, employeeId } = req.query;
  if (date)       records = records.filter((r: any) => r.date === String(date));
  if (employeeId) records = records.filter((r: any) => r.employeeId === String(employeeId));
  res.json({ success: true, data: records });
});

// POST /api/attendance/checkin — Supports Campus or WFH mode with custom location
router.post('/checkin', (req: Request, res: Response) => {
  const { employeeId, employeeName, location, mode, overrideCampus } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const records = readDB<any>('attendance');
  const existing = records.find((r: any) => r.employeeId === employeeId && r.date === today);

  if (existing?.checkIn) {
    return res.status(400).json({ success: false, message: 'Already checked in today' });
  }

  // Check if WFH mode selected or approved
  const wfhRequests = readDB<any>('wfh');
  const approvedWFH = wfhRequests.find(
    (w: any) => w.employeeId === employeeId && w.date === today && w.status === 'Approved'
  );

  const isWFH = mode === 'wfh' || !!approvedWFH;
  const finalStatus = isWFH ? 'WFH' : 'Present';
  const finalLocation = location || (isWFH ? 'Remote (WFH)' : 'Main HQ Campus');

  if (existing) {
    const updated = updateOne('attendance', existing.id, {
      checkIn: time, status: finalStatus, location: finalLocation, isWFH
    });
    return res.json({
      success: true,
      data: updated,
      message: isWFH ? `Checked in (WFH - ${finalLocation}) at ${time}` : `Checked in at ${finalLocation} (${time})`
    });
  }

  const record = {
    id: `att-${uuidv4()}`,
    employeeId,
    employeeName,
    date: today,
    checkIn: time,
    checkOut: null,
    workHours: 0,
    status: finalStatus,
    location: finalLocation,
    isWFH,
  };

  const all = readDB<any>('attendance');
  all.unshift(record);
  writeDB('attendance', all);

  res.json({
    success: true,
    data: record,
    message: isWFH ? `Checked in (WFH - ${finalLocation}) at ${time}` : `Checked in at ${finalLocation} (${time})`
  });
});

// POST /api/attendance/checkout
router.post('/checkout', (req: Request, res: Response) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const records = readDB<any>('attendance');
  const record = records.find((r: any) => r.employeeId === employeeId && r.date === today);

  if (!record?.checkIn) return res.status(400).json({ success: false, message: 'Not checked in yet' });
  if (record.checkOut) return res.status(400).json({ success: false, message: 'Already checked out' });

  const parseTime = (t: string) => {
    const [tStr, period] = t.split(' ');
    let [h, m] = tStr.split(':').map(Number);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h + m / 60;
  };
  const workHours = Math.max(0, parseTime(time) - parseTime(record.checkIn));

  const updated = updateOne('attendance', record.id, { checkOut: time, workHours: Math.round(workHours * 10) / 10 });
  res.json({ success: true, data: updated, message: `Checked out at ${time}. ${workHours.toFixed(1)}h logged.` });
});

// PUT /api/attendance/:id — admin edit
router.put('/:id', (req: Request, res: Response) => {
  const updated = updateOne('attendance', String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
  res.json({ success: true, data: updated });
});

export default router;
