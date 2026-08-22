import { Router, Request, Response } from 'express';
import { readDB, writeDB, updateOne } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper to safely parse time strings (e.g. "08:45 AM", "09:30:15 AM", "14:20") into decimal hours
export function parseHours(timeStr: string): number {
  if (!timeStr) return 0;
  try {
    // Sanitize non-breaking spaces (\u00a0) and extra whitespace
    const cleanStr = timeStr.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = cleanStr.split(' ');
    const timeParts = parts[0].split(':').map(Number);
    let hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;
    const period = parts[1] ? parts[1].toUpperCase() : null;

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours + (minutes / 60);
  } catch {
    return 0;
  }
}

export function calculateWorkHours(checkInStr: string, checkOutStr: string): number {
  if (!checkInStr || !checkOutStr) return 0;
  const inHours = parseHours(checkInStr);
  let outHours = parseHours(checkOutStr);

  if (outHours < inHours) {
    outHours += 24;
  }

  let diff = outHours - inHours;
  if (diff <= 0 || isNaN(diff)) return 0;
  return Math.round(diff * 10) / 10;
}

// GET /api/attendance?date=YYYY-MM-DD&employeeId=EMP-XXX
router.get('/', (req: Request, res: Response) => {
  let records = readDB<any>('attendance');
  const { date, employeeId } = req.query;
  if (date)       records = records.filter((r: any) => r.date === String(date));
  if (employeeId) records = records.filter((r: any) => r.employeeId === String(employeeId));
  res.json({ success: true, data: records });
});

// POST /api/attendance/checkin — Accepts Campus or WFH mode with custom/GPS location
router.post('/checkin', (req: Request, res: Response) => {
  const { employeeId, employeeName, location, mode } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const records = readDB<any>('attendance');
  const existing = records.find((r: any) => r.employeeId === employeeId && r.date === today);

  if (existing?.checkIn && !existing.checkOut) {
    return res.status(400).json({ success: false, message: 'Already checked in today' });
  }

  // Check if WFH mode selected or approved
  const wfhRequests = readDB<any>('wfh');
  const approvedWFH = wfhRequests.find(
    (w: any) => w.employeeId === employeeId && w.date === today && w.status === 'Approved'
  );

  const locLower = (location || '').toLowerCase();
  const isWFH = mode === 'wfh' || !!approvedWFH || locLower.includes('home') || locLower.includes('wfh') || locLower.includes('remote');
  const finalStatus = isWFH ? 'WFH' : 'Present';
  const finalLocation = location || (isWFH ? 'Work From Home' : 'Main HQ Campus');

  if (existing) {
    const updated = updateOne('attendance', existing.id, {
      checkIn: time, checkOut: null, workHours: 0, status: finalStatus, location: finalLocation, isWFH
    });
    return res.json({
      success: true,
      data: updated,
      message: `Checked in successfully at ${time} (${finalLocation})`
    });
  }

  const record = {
    id: `att-${uuidv4()}`,
    employeeId,
    employeeName: employeeName || 'Employee',
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
    message: `Checked in successfully at ${time} (${finalLocation})`
  });
});

// POST /api/attendance/checkout
router.post('/checkout', (req: Request, res: Response) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const records = readDB<any>('attendance');
  const record = records.find((r: any) => r.employeeId === employeeId && r.date === today);

  if (!record?.checkIn) {
    return res.status(400).json({ success: false, message: 'Not checked in yet' });
  }

  if (record.checkOut) {
    return res.status(400).json({ success: false, message: 'Already checked out today' });
  }

  const loggedHours = calculateWorkHours(record.checkIn, time);

  const updated = updateOne('attendance', record.id, {
    checkOut: time,
    workHours: loggedHours
  });

  res.json({
    success: true,
    data: updated,
    message: `Checked out successfully at ${time}. ${loggedHours} hours logged.`
  });
});

// DELETE /api/attendance/reset — Reset today's attendance record for an employee
router.delete('/reset', (req: Request, res: Response) => {
  const { employeeId, date } = req.query;
  const records = readDB<any>('attendance');
  const filtered = records.filter(
    (r: any) => !(r.employeeId === String(employeeId) && r.date === String(date))
  );
  writeDB('attendance', filtered);
  res.json({ success: true, message: 'Attendance reset successfully' });
});

// PUT /api/attendance/:id — admin edit
router.put('/:id', (req: Request, res: Response) => {
  const existing = readDB<any>('attendance').find((r: any) => r.id === String(req.params.id));
  let updateData = { ...req.body };

  if (updateData.checkIn || updateData.checkOut) {
    const finalIn = updateData.checkIn || existing?.checkIn;
    const finalOut = updateData.checkOut || existing?.checkOut;
    if (finalIn && finalOut) {
      updateData.workHours = calculateWorkHours(finalIn, finalOut);
    }
  }

  const updated = updateOne('attendance', String(req.params.id), updateData);
  if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
  res.json({ success: true, data: updated });
});

export default router;
