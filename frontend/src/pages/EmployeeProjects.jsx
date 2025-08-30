import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Container,
  LoadingSpinner,
  ErrorMessage,
  Card,
} from "../components/common";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/api/employee/projects`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError(error.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "employee") {
      fetchProjects();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4 flex items-center justify-center">
        <LoadingSpinner text="Loading your projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4 flex items-center justify-center">
        <Container maxWidth="max-w-md">
          <ErrorMessage error={error} variant="card" />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Container variant="card">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-cyan-900 mb-2">
                My Projects
              </h1>
              <p className="text-cyan-700">
                Projects where you have assigned subtasks
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {projects.length}
              </div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
          </div>
        </Container>

        {/* Quick Access */}
        <Container variant="card">
          <a
            href="/kanban"
            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
          >
            <div>
              <div className="font-semibold text-lg">My Task Board</div>
              <div className="text-sm opacity-90">
                View and manage all your subtasks in one place
              </div>
            </div>
            <div className="text-3xl">📋</div>
          </a>
        </Container>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Container variant="card" className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Projects Assigned
            </h3>
            <p className="text-gray-500">
              You don't have any subtasks assigned in any projects yet.
            </p>
          </Container>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  const getStatusColor = (progress) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getStatusText = (progress) => {
    if (progress >= 100) return "Completed";
    if (progress >= 70) return "Near Completion";
    if (progress >= 40) return "In Progress";
    return "Getting Started";
  };

  return (
    <Card hover className="transition-transform hover:scale-105">
      <div className="space-y-4">
        {/* Project Header */}
        <div>
          <h3 className="text-lg font-bold text-cyan-900 mb-1">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-gray-900">
              {project.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getStatusColor(
                project.progress
              )}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {getStatusText(project.progress)}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">
              {project.employeeSubtaskCount}
            </div>
            <div className="text-xs text-blue-700">My Subtasks</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">
              {project.subtasks?.length || 0}
            </div>
            <div className="text-xs text-green-700">Total Subtasks</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <a
            href={`/projects/${project._id}?tab=gantt`}
            className="block w-full text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            View Gantt Chart
          </a>
        </div>
      </div>
    </Card>
  );
}
