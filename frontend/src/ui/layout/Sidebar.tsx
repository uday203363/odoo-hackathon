import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign, BarChart3,
  Building2, ClipboardCheck, Megaphone, Ticket, Target, HomeIcon, ShieldAlert, UserCheck
} from 'lucide-react';

const NavItem: React.FC<{ id: string; label: string; icon: React.ReactNode; badge?: number }> = ({ id, label, icon, badge }) => {
  const { activeTab, setActiveTab } = useApp();
  return (
    <button className={`nav-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
      {icon} <span>{label}</span>
      {badge != null && badge > 0 && <span className="nav-badge">{badge}</span>}
    </button>
  );
};

export const Sidebar: React.FC = () => {
  const { currentUser, leaveRequests, wfhRequests, tickets } = useApp();
  const isAdmin = currentUser.role === 'admin';

  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending').length;
  const pendingWFH = wfhRequests.filter(r => r.status === 'Pending').length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;

  return (
    <aside className="sidebar">
      <div className="nav-section">Main</div>
      <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={16} />} />

      {isAdmin ? (
        <>
          <div className="nav-section">Workforce</div>
          <NavItem id="employees" label="Employee Management" icon={<Users size={16} />} />
          <NavItem id="departments" label="Departments & Org" icon={<Building2 size={16} />} />
          <NavItem id="attendance" label="Attendance & Log" icon={<Clock size={16} />} />
          <NavItem id="leaves" label="Leave Approvals" icon={<CalendarDays size={16} />} badge={pendingLeaves + pendingWFH} />

          <div className="nav-section">HR Management</div>
          <NavItem id="profile" label="My HR Profile" icon={<UserCheck size={16} />} />
          <NavItem id="payroll" label="Payroll & Salaries" icon={<DollarSign size={16} />} />
          <NavItem id="compliance" label="Compliance Center" icon={<ClipboardCheck size={16} />} />
          <NavItem id="goals" label="Goals & Performance" icon={<Target size={16} />} />
          <NavItem id="announcements" label="Announcements" icon={<Megaphone size={16} />} />
          <NavItem id="tickets" label="Help Desk" icon={<Ticket size={16} />} badge={openTickets} />
          <NavItem id="analytics" label="HR Analytics" icon={<BarChart3 size={16} />} />
        </>
      ) : (
        <>
          <div className="nav-section">My Work</div>
          <NavItem id="attendance" label="My Attendance" icon={<Clock size={16} />} />
          <NavItem id="leaves" label="My Leaves & WFH" icon={<CalendarDays size={16} />} />
          <NavItem id="payroll" label="My Payslips" icon={<DollarSign size={16} />} />
          <NavItem id="goals" label="My Goals" icon={<Target size={16} />} />

          <div className="nav-section">Company</div>
          <NavItem id="profile" label="My Profile" icon={<UserCheck size={16} />} />
          <NavItem id="team" label="Team Directory" icon={<HomeIcon size={16} />} />
          <NavItem id="announcements" label="Announcements" icon={<Megaphone size={16} />} />
          <NavItem id="tickets" label="Help Desk" icon={<Ticket size={16} />} />
        </>
      )}

      <div className="nav-spacer" />
      <div className="sidebar-footer">
        <div className="sidebar-role-badge">
          <p><ShieldAlert size={12} style={{ display: 'inline', marginRight: 4 }} />Active Role</p>
          <span>{isAdmin ? 'Administrator Access' : 'Employee Access'}</span>
        </div>
      </div>
    </aside>
  );
};
