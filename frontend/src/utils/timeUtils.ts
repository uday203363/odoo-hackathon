/**
 * Standardized Time & Workday Calculation Utilities for HRMS
 */

export function parseTimeToDecimalHours(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

  // Case 1: ISO string (e.g. 2026-08-22T08:45:00.000Z)
  if (clean.includes('T')) {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    }
  }

  // Case 2: 12-hour or 24-hour time string (e.g. "08:45 AM", "08:45:30 AM", "08:45AM", "14:30", "14:30:15")
  const match = clean.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const period = match[4] ? match[4].toUpperCase() : null;

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours + minutes / 60 + seconds / 3600;
  }

  return 0;
}

export function parseCheckInToDate(timeStr: string, dateStr?: string): Date | null {
  if (!timeStr) return null;
  const clean = timeStr.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

  if (clean.includes('T')) {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return d;
  }

  const match = clean.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const period = match[4] ? match[4].toUpperCase() : null;

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const baseDate = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(baseDate.getTime())) return null;

    const d = new Date(baseDate);
    d.setHours(hours, minutes, seconds, 0);
    return d;
  }

  return null;
}

export function calculateWorkHours(checkInStr: string, checkOutStr: string): number {
  if (!checkInStr || !checkOutStr) return 0;
  const inHours = parseTimeToDecimalHours(checkInStr);
  let outHours = parseTimeToDecimalHours(checkOutStr);

  if (outHours < inHours) {
    outHours += 24; // Cross-midnight shift
  }

  const diff = outHours - inHours;
  if (diff <= 0 || isNaN(diff)) return 0;
  return Math.round(diff * 100) / 100;
}

export function formatWorkHours(decimalHours: number): { formatted: string; decimal: string; full: string } {
  if (!decimalHours || decimalHours <= 0 || isNaN(decimalHours)) {
    return { formatted: '0h 0m', decimal: '0.00 hrs', full: '0h 0m (0.00 hrs)' };
  }

  const totalMinutes = Math.round(decimalHours * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const formatted = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h 0m`;
  const decimal = `${decimalHours.toFixed(2)} hrs`;
  const full = `${formatted} (${decimal})`;

  return { formatted, decimal, full };
}

export function getShiftMetrics(elapsedHours: number, targetHours = 8.0) {
  const safeElapsed = Math.max(0, isNaN(elapsedHours) ? 0 : elapsedHours);
  const elapsedTotalMins = Math.floor(safeElapsed * 60);
  const eHrs = Math.floor(elapsedTotalMins / 60);
  const eMins = elapsedTotalMins % 60;
  const elapsedFormatted = `${eHrs}h ${String(eMins).padStart(2, '0')}m`;

  const targetTotalMins = Math.round(targetHours * 60);
  const progressPercent = Math.min(100, Math.round((elapsedTotalMins / targetTotalMins) * 100));

  const remainingTotalMins = Math.max(0, targetTotalMins - elapsedTotalMins);
  const rHrs = Math.floor(remainingTotalMins / 60);
  const rMins = remainingTotalMins % 60;
  const remainingFormatted = `${rHrs}h ${String(rMins).padStart(2, '0')}m`;

  const isOvertime = elapsedTotalMins > targetTotalMins;
  const overtimeTotalMins = isOvertime ? elapsedTotalMins - targetTotalMins : 0;
  const otHrs = Math.floor(overtimeTotalMins / 60);
  const otMins = overtimeTotalMins % 60;
  const overtimeFormatted = `+${otHrs}h ${String(otMins).padStart(2, '0')}m`;

  let statusLabel = 'In Progress';
  if (elapsedTotalMins >= targetTotalMins) {
    statusLabel = 'Target Hours Met';
  } else if (elapsedTotalMins >= targetTotalMins * 0.5) {
    statusLabel = 'Half Shift Completed';
  }

  return {
    safeElapsed,
    targetHours,
    progressPercent,
    elapsedFormatted,
    remainingFormatted,
    isOvertime,
    overtimeFormatted,
    statusLabel
  };
}
