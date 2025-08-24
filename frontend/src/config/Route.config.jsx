import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import OnboardingPage from "../pages/OnboardingPage";
import DashboardPage from "../pages/DashboardPage";
import ReportsPage from "../pages/ReportsPage";
import SettingsPage from "../pages/SettingsPage";

import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";

import ProjectsPage from "../pages/ProjectsPage";
import CreateProjectPage from "../pages/CreateProject";
import RolesPage from "../pages/RolesPage";
import MembersPage from "../pages/MembersPage";
import RegisterCompanyPage from "../pages/RegisterCompanyPage";
import ProtectedRoute from "../components/ProtectedRoute";
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
          <DashboardPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <ReportsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/members",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <MembersPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/roles",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <RolesPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/projects",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <ProjectsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/createproject",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <CreateProjectPage />
        </DashboardLayout>
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
