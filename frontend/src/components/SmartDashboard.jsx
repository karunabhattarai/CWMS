import { useAuth } from "../hooks/useAuth";
import DashboardPage from "../pages/DashboardPage";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import { LoadingSpinner } from "../components/common";

export default function SmartDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4 flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  // Show employee dashboard for employees, regular dashboard for managers/superadmins
  if (user?.role === "employee") {
    return <EmployeeDashboard />;
  }

  return <DashboardPage />;
}
