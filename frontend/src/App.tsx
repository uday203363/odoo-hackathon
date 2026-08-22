import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DemoBar, Navbar } from './ui/layout/Navbar';
import { Sidebar } from './ui/layout/Sidebar';
import { ToastContainer } from './ui/components/common';
import { LoginPage } from './modules/auth/LoginPage';
import { SuperAdminDashboard } from './modules/admin/SuperAdminDashboard';
import { HRDashboard } from './modules/admin/HRDashboard';
import { EmployeeDashboard } from './modules/employee/EmployeeDashboard';
import { EmployeeManagement } from './modules/admin/EmployeeManagement';
import { DepartmentManager } from './modules/admin/DepartmentManager';
import { AttendanceManager } from './modules/admin/AttendanceAdmin';
import { PayrollManager } from './modules/admin/PayrollAdmin';
import { ComplianceCenter } from './modules/admin/ComplianceCenter';
import { HRAnalytics } from './modules/admin/HRAnalytics';
import { AnnouncementsManager } from './modules/admin/AnnouncementsManager';
import { LeaveWFHManager } from './modules/employee/LeaveWFHManager';
import { TeamDirectory } from './modules/employee/TeamDirectory';
import { HelpDesk } from './modules/employee/HelpDesk';
import { GoalsPerformance } from './modules/employee/GoalsPerformance';
import './styles/globals.css';

const AppContent: React.FC = () => {
  const { currentUser, activeTab, isAuthenticated, logout } = useApp();

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isHR = currentUser.role === 'admin' || currentUser.role === 'hr';
  const isAdminOrHR = isSuperAdmin || isHR;

  const renderDashboard = () => {
    if (isSuperAdmin) return <SuperAdminDashboard />;
    if (isHR) return <HRDashboard />;
    return <EmployeeDashboard />;
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':     return renderDashboard();
      case 'employees':     return isAdminOrHR ? <EmployeeManagement /> : null;
      case 'departments':   return isAdminOrHR ? <DepartmentManager /> : null;
      case 'attendance':    return <AttendanceManager />;
      case 'leaves':        return <LeaveWFHManager />;
      case 'payroll':       return <PayrollManager />;
      case 'compliance':    return isAdminOrHR ? <ComplianceCenter /> : null;
      case 'goals':         return <GoalsPerformance />;
      case 'announcements': return <AnnouncementsManager />;
      case 'tickets':       return <HelpDesk />;
      case 'analytics':     return isAdminOrHR ? <HRAnalytics /> : null;
      case 'team':          return <TeamDirectory />;
      case 'profile':       return <EmployeeManagement />;
      default:              return renderDashboard();
    }
  };

  return (
    <div className="app-shell">
      <DemoBar />
      <Navbar onOpenAuth={logout} />
      <div className="main-layout">
        <Sidebar />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
