import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LeadLandingPage from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Sales / Manager Portal Pages
import Dashboard from './pages/sales/Dashboard';
import MyTeam from './pages/sales/MyTeam';
import Leads from './pages/sales/Leads';
import LeadDetailsPage from './pages/sales/LeadDetailsPage';
import Pipeline from './pages/sales/Pipeline';
import Tasks from './pages/sales/Tasks';
import Reports from './pages/sales/Reports';
import Contacts from './pages/sales/Contacts';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/Users';
import DepartmentsTeams from './pages/admin/DepartmentsTeams';
import RolesPermissions from './pages/admin/RolesPermissions';
import AdminProfile from './pages/admin/Profile';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';

// Sales Person Portal Pages
import SalesPersonDashboard from './pages/salesperson/Dashboard';
import SalesProfile from './pages/salesperson/SalesProfile';

// Helper component to redirect generic links to the exact role portal
function RoleRedirect({ salesPersonPath, managerPath, adminPath }) {
  const { role } = useAuth();
  if (role === 'admin' && adminPath) return <Navigate to={adminPath} replace />;
  if (role === 'sales_person') return <Navigate to={salesPersonPath} replace />;
  return <Navigate to={managerPath} replace />;
}

function App() {
  return (
    <Routes>
      {/* ─── 1. PUBLIC & AUTH ───────────────────────────────────── */}
      <Route path="/" element={<LeadLandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      {/* ─── 2. PROTECTED CRM ROUTES (Login Required) ────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* 👑 ADMIN ROUTES (Super Admin Only) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/teams" element={<DepartmentsTeams />} />
            <Route path="/admin/roles" element={<RolesPermissions />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          {/* 💼 SALESPERSON ROUTES (Sales Representative Only) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager', 'sales_person']} />}>
            <Route path="/salesperson/dashboard" element={<SalesPersonDashboard />} />
            <Route path="/salesperson/profile" element={<SalesProfile />} />
            <Route path="/salesperson/leads" element={<Leads defaultRole="sales_person" />} />
            <Route path="/salesperson/leads/:id" element={<LeadDetailsPage defaultRole="sales_person" />} />
            <Route path="/salesperson/pipeline" element={<Pipeline defaultRole="sales_person" />} />
            <Route path="/salesperson/tasks" element={<Tasks defaultRole="sales_person" />} />
            <Route path="/salesperson/reports" element={<Reports defaultRole="sales_person" />} />
          </Route>

          {/* 👔 SALES MANAGER ROUTES (Admin & Sales Manager) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager']} />}>
            <Route path="/manager/dashboard" element={<Dashboard />} />
            <Route path="/manager/team" element={<MyTeam />} />
            <Route path="/manager/contacts" element={<Contacts />} />
            <Route path="/manager/leads" element={<Leads defaultRole="sales_manager" />} />
            <Route path="/manager/leads/:id" element={<LeadDetailsPage defaultRole="sales_manager" />} />
            <Route path="/manager/pipeline" element={<Pipeline defaultRole="sales_manager" />} />
            <Route path="/manager/tasks" element={<Tasks defaultRole="sales_manager" />} />
            <Route path="/manager/reports" element={<Reports defaultRole="sales_manager" />} />
            <Route path="/manager/profile" element={<SalesProfile />} />
            <Route path="/sales/profile" element={<SalesProfile />} />
            <Route path="/manager/settings" element={<AdminSettings />} />
          </Route>

          {/* 🌐 GENERAL CRM ROUTES (Redirect dynamically based on user's logged-in role) */}
          <Route path="/leads/:id" element={<LeadDetailsPage />} />
          <Route
            path="/dashboard"
            element={
              <RoleRedirect
                adminPath="/admin"
                managerPath="/manager/dashboard"
                salesPersonPath="/salesperson/dashboard"
              />
            }
          />
          <Route
            path="/leads"
            element={
              <RoleRedirect
                adminPath="/manager/leads"
                managerPath="/manager/leads"
                salesPersonPath="/salesperson/leads"
              />
            }
          />
          <Route
            path="/contacts"
            element={
              <RoleRedirect
                adminPath="/manager/contacts"
                managerPath="/manager/contacts"
                salesPersonPath="/salesperson/dashboard"
              />
            }
          />
          <Route
            path="/pipeline"
            element={
              <RoleRedirect
                adminPath="/manager/pipeline"
                managerPath="/manager/pipeline"
                salesPersonPath="/salesperson/pipeline"
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <RoleRedirect
                adminPath="/manager/tasks"
                managerPath="/manager/tasks"
                salesPersonPath="/salesperson/tasks"
              />
            }
          />
          <Route
            path="/reports"
            element={
              <RoleRedirect
                adminPath="/admin/reports"
                managerPath="/manager/reports"
                salesPersonPath="/salesperson/reports"
              />
            }
          />
          <Route
            path="/settings"
            element={
              <RoleRedirect
                adminPath="/admin/settings"
                managerPath="/manager/settings"
                salesPersonPath="/salesperson/dashboard"
              />
            }
          />
          <Route
            path="/profile"
            element={
              <RoleRedirect
                adminPath="/admin/profile"
                managerPath="/manager/profile"
                salesPersonPath="/salesperson/profile"
              />
            }
          />

        </Route>
      </Route>

      {/* ─── 3. 404 NOT FOUND ───────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
