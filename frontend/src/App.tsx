import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DemoBar, Navbar } from './ui/layout/Navbar';
import { Sidebar } from './ui/layout/Sidebar';
import { ToastContainer } from './ui/components/common';
import { LoginPage } from './modules/auth/LoginPage';
import { AdminDashboard } from './modules/admin/AdminDashboard';
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
  const isAdmin = currentUser?.role === 'admin';

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':     return isAdmin ? <AdminDashboard /> : <EmployeeDashboard />;
      case 'employees':     return isAdmin ? <EmployeeManagement /> : null;
      case 'departments':   return isAdmin ? <DepartmentManager /> : null;
      case 'attendance':    return <AttendanceManager />;
      case 'leaves':        return <LeaveWFHManager />;
      case 'payroll':       return <PayrollManager />;
      case 'compliance':    return isAdmin ? <ComplianceCenter /> : null;
      case 'goals':         return <GoalsPerformance />;
      case 'announcements': return <AnnouncementsManager />;
      case 'tickets':       return <HelpDesk />;
      case 'analytics':     return isAdmin ? <HRAnalytics /> : null;
      case 'team':          return <TeamDirectory />;
      case 'profile':       return <EmployeeManagement />;
      default:              return isAdmin ? <AdminDashboard /> : <EmployeeDashboard />;
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
