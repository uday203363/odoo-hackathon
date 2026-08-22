import express from 'express';
import cors from 'cors';
import { seedAll } from './db/seed';
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import attendanceRoutes from './routes/attendance';
import leaveRoutes from './routes/leaves';
import wfhRoutes from './routes/wfh';
import payrollRoutes from './routes/payroll';
import departmentRoutes from './routes/departments';
import announcementRoutes from './routes/announcements';
import ticketRoutes from './routes/tickets';
import complianceRoutes from './routes/compliance';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Seed initial database files if empty
seedAll();

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Dayflow HRMS Backend', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/wfh', wfhRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/compliance', complianceRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dayflow HRMS Backend Server running on http://localhost:${PORT}`);
});
