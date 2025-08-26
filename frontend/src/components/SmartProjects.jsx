import { useAuth } from "../hooks/useAuth";
import ProjectsPage from "../pages/ProjectsPage";
import EmployeeProjects from "../pages/EmployeeProjects";
import { LoadingSpinner } from "../components/common";

export default function SmartProjects() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4 flex items-center justify-center">
        <LoadingSpinner text="Loading projects..." />
      </div>
    );
  }

  // Show employee projects for employees, regular projects page for managers/superadmins
  if (user?.role === "employee") {
    return <EmployeeProjects />;
  }

  return <ProjectsPage />;
}
