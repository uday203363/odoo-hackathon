import React from 'react';
import type { PayrollRecord, User } from '../../types';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface PayslipModalProps {
  payroll: PayrollRecord;
  employee?: User;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payroll, employee, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 350 }}>
      <div className="modal-content" style={{ maxWidth: '750px', background: '#ffffff' }}>
        <div className="modal-header" style={{ background: '#714b67', color: 'white' }}>
          <h3 className="modal-title" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} /> Official Salary Slip - Dayflow HRMS
          </h3>
          <button onClick={onClose} style={{ color: 'white' }}><X size={20} /></button>
        </div>

        <div className="modal-body" id="printable-payslip" style={{ padding: '2rem' }}>
          {/* Header branding */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #714b67', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ color: '#714b67', fontWeight: 800, fontSize: '1.5rem' }}>DAYFLOW TECHNOLOGIES</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Human Resource & Workforce Operations</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>100 Market Street, San Francisco, CA 94105</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-approved" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                PAYMENT DISBURSED
              </span>
              <h3 style={{ marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>{payroll.month}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Ref ID: {payroll.id}</p>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>EMPLOYEE NAME</p>
              <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{payroll.employeeName}</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Employee ID: {payroll.employeeId}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>DEPARTMENT & DESIGNATION</p>
              <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{employee?.department || 'Operations'}</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{employee?.designation || 'Staff'}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <table className="custom-table" style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th>EARNINGS & ALLOWANCES</th>
                <th style={{ textAlign: 'right' }}>AMOUNT ($)</th>
                <th>DEDUCTIONS</th>
                <th style={{ textAlign: 'right' }}>AMOUNT ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>${payroll.basic.toLocaleString()}</td>
                <td>Provident Fund (PF)</td>
                <td style={{ textAlign: 'right', color: '#dc2626' }}>${payroll.pfDeduction.toLocaleString()}</td>
              </tr>
              <tr>
                <td>House Rent Allowance (HRA)</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>${payroll.hra.toLocaleString()}</td>
                <td>Income Tax (TDS)</td>
                <td style={{ textAlign: 'right', color: '#dc2626' }}>${payroll.taxDeduction.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Conveyance Allowance</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>${payroll.conveyance.toLocaleString()}</td>
                <td>—</td>
                <td style={{ textAlign: 'right' }}>—</td>
              </tr>
              <tr>
                <td>Special Allowance</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>${payroll.specialAllowance.toLocaleString()}</td>
                <td>—</td>
                <td style={{ textAlign: 'right' }}>—</td>
              </tr>
              <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                <td>TOTAL GROSS EARNINGS</td>
                <td style={{ textAlign: 'right', color: '#059669', fontSize: '1.05rem' }}>${payroll.grossPay.toLocaleString()}</td>
                <td>TOTAL DEDUCTIONS</td>
                <td style={{ textAlign: 'right', color: '#dc2626', fontSize: '1.05rem' }}>
                  -${(payroll.pfDeduction + payroll.taxDeduction).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Net Salary Highlight */}
          <div style={{ background: '#f5eff3', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #714b67', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#714b67', fontWeight: 700 }}>NET PAYABLE AMOUNT DISBURSED</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#714b67' }}>${payroll.netPay.toLocaleString()}</h2>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
              <p>Disbursed Date: {payroll.paymentDate || '2026-08-01'}</p>
              <p>Status: Verified & Processed</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">Close</button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};
