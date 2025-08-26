import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import OnboardingPage from "../pages/OnboardingPage";
import DashboardPage from "../pages/DashboardPage";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import ReportsPage from "../pages/ReportsPage";
import SettingsPage from "../pages/SettingsPage";

import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";

import ProjectsPage from "../pages/ProjectsPage";
import EmployeeProjects from "../pages/EmployeeProjects";
import SmartDashboard from "../components/SmartDashboard";
import SmartProjects from "../components/SmartProjects";
import EmployeeKanban from "../pages/EmployeeKanban";
import CreateProjectPage from "../pages/CreateProject";
import RolesPage from "../pages/RolesPage";
import MembersPage from "../pages/MembersPage";
import RegisterCompanyPage from "../pages/RegisterCompanyPage";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import CompanyGuardedRoute from "../components/CompanyGuardedRoute";
import AuthRedirectRoute from "../components/AuthRedirectRoute";
import TaskDetailsPage from "../pages/TaskDetailsPage";

export const routes = [
  {
    path: "/",
    element: (
      <AuthRedirectRoute>
        <PublicLayout>
          <LandingPage />
        </PublicLayout>
      </AuthRedirectRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <>
        <PublicLayout>
          <AuthPage />
        </PublicLayout>
      </>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <>
        <PublicLayout>
          <ResetPasswordPage />
        </PublicLayout>
      </>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <CompanyGuardedRoute>
          <PublicLayout>
            <OnboardingPage />
          </PublicLayout>
        </CompanyGuardedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/company-registration",
    element: (
      <ProtectedRoute>
        <PublicLayout>
          <RegisterCompanyPage />
        </PublicLayout>
      </ProtectedRoute>
    ),
  },
  // Dashboard and sidebar routes
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <SmartDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={["superadmin", "manager"]}>
          <DashboardLayout>
            <ReportsPage />
          </DashboardLayout>
        </RoleProtectedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/members",
    element: (
      <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={["superadmin", "manager"]}>
          <DashboardLayout>
            <MembersPage />
          </DashboardLayout>
        </RoleProtectedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/roles",
    element: (
      <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={["superadmin", "manager"]}>
          <DashboardLayout>
            <RolesPage />
          </DashboardLayout>
        </RoleProtectedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/projects",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <SmartProjects />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/kanban",
    element: (
      <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={["employee"]}>
          <DashboardLayout>
            <EmployeeKanban />
          </DashboardLayout>
        </RoleProtectedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/createproject",
    element: (
      <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={["superadmin", "manager"]}>
          <DashboardLayout>
            <CreateProjectPage />
          </DashboardLayout>
        </RoleProtectedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/projects/:taskId",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <TaskDetailsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <SettingsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
];
