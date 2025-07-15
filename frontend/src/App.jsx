import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardLayout from "./layouts/DashboardLayout";

import ProjectsPage from "./pages/ProjectsPage";
import CreateProjectPage from "./pages/CreateProject";
import RolesPage from "./pages/RolesPage";
import MembersPage from "./pages/MembersPage";
import RegisterCompanyPage from "./pages/RegisterCompanyPage";

import { AuthProvider } from "./context/AuthContext";
// Dummy pages for sidebar routes
const ReportsPage = () => <div className="p-8">Reports Page</div>;
const SettingsPage = () => <div className="p-8">Settings Page</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Public pages */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <LandingPage />
                <Footer />
              </>
            }
          />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/company-registration"
            element={
              <>
                <Navbar />
                <RegisterCompanyPage />
                <Footer />
              </>
            }
          />

          {/* Dashboard and sidebar routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <DashboardLayout>
                <ReportsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/members"
            element={
              <DashboardLayout>
                <MembersPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/roles"
            element={
              <DashboardLayout>
                <RolesPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/projects"
            element={
              <DashboardLayout>
                <ProjectsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/createproject"
            element={
              <DashboardLayout>
                <CreateProjectPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
