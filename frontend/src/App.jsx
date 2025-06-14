import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardLayout from "./layouts/DashboardLayout";

// Dummy pages for sidebar routes
const ReportsPage = () => <div className="p-8">Reports Page</div>;
const MembersPage = () => <div className="p-8">Members Page</div>;
const RolesPage = () => <div className="p-8">Roles Page</div>;
const ProjectsPage = () => <div className="p-8">Projects Page</div>;
const SettingsPage = () => <div className="p-8">Settings Page</div>;

function App() {
  return (
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
          path="/settings"
          element={
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
