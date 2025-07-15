import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import OnboardingPage from "../pages/OnboardingPage";
import DashboardPage from "../pages/DashboardPage";

import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";

import ProjectsPage from "../pages/ProjectsPage";
import CreateProjectPage from "../pages/CreateProject";
import RolesPage from "../pages/RolesPage";
import MembersPage from "../pages/MembersPage";
import RegisterCompanyPage from "../pages/RegisterCompanyPage";
import ProtectedRoute from "../components/ProtectedRoute";
import CompanyGuardedRoute from "../components/CompanyGuardedRoute";

const ReportsPage = () => <div className="p-8">Reports Page</div>;
const SettingsPage = () => <div className="p-8">Settings Page</div>;

export const routes = [
  {
    path: "/",
    element: (
      <>
        <PublicLayout>
          <LandingPage />
        </PublicLayout>
      </>
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
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/reports",
    element: (
      <DashboardLayout>
        <ReportsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/members",
    element: (
      <DashboardLayout>
        <MembersPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/roles",
    element: (
      <DashboardLayout>
        <RolesPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/projects",
    element: (
      <DashboardLayout>
        <ProjectsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/createproject",
    element: (
      <DashboardLayout>
        <CreateProjectPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/settings",
    element: (
      <DashboardLayout>
        <SettingsPage />
      </DashboardLayout>
    ),
  },
];
