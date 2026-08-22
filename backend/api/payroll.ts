// ============================================================
// BACKEND — Payroll Computation Engine
// ============================================================
import type { User, PayrollRecord } from '../../frontend/src/types';

export const computePayroll = (user: User, month: string, presentDays = 26, workingDays = 26): PayrollRecord => {
  const { salary } = user;
  const grossPay = salary.basic + salary.hra + salary.conveyance + salary.specialAllowance + (salary.medicalAllowance || 0);
  const totalDeductions = salary.pfDeduction + salary.taxDeduction + (salary.professionalTax || 0);
  const netPay = grossPay - totalDeductions;

  return {
    id: `pay-${user.employeeId}-${Date.now()}`,
    employeeId: user.employeeId,
    employeeName: user.name,
    month,
    basic: salary.basic,
    hra: salary.hra,
    conveyance: salary.conveyance,
    specialAllowance: salary.specialAllowance,
    medicalAllowance: salary.medicalAllowance || 0,
    grossPay,
    pfDeduction: salary.pfDeduction,
    taxDeduction: salary.taxDeduction,
    professionalTax: salary.professionalTax || 0,
    totalDeductions,
    netPay,
    paymentStatus: 'Paid',
    paymentDate: new Date().toISOString().split('T')[0],
    workingDays,
    presentDays,
  };
};

export const runBatchPayroll = (users: User[], month: string): PayrollRecord[] => {
  return users.map(u => computePayroll(u, month));
};
