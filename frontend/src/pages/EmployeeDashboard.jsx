import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Container, LoadingSpinner, ErrorMessage } from "../components/common";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/api/employee/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "employee") {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4 flex items-center justify-center">
        <LoadingSpinner text="Loading your dashboard..." />
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

  const { employee, subtaskStats, missedDeadlines, ongoingSubtasks } =
    dashboardData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <Container variant="card">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-cyan-900 mb-2">
              Welcome back, {employee?.name}!
            </h1>
            <p className="text-cyan-700 text-lg">{employee?.company}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {employee?.roles?.map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </Container>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ongoing Subtasks */}
          <Container variant="card" className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {ongoingSubtasks}
            </div>
            <div className="text-gray-600 text-sm font-medium">
              Ongoing Subtasks
            </div>
          </Container>

          {/* Total Subtasks */}
          <Container variant="card" className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {subtaskStats?.total || 0}
            </div>
            <div className="text-gray-600 text-sm font-medium">
              Total Assigned
            </div>
          </Container>

          {/* Completed */}
          <Container variant="card" className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {subtaskStats?.completed || 0}
            </div>
            <div className="text-gray-600 text-sm font-medium">Completed</div>
          </Container>

          {/* Missed Deadlines */}
          <Container variant="card" className="text-center">
            <div
              className={`text-3xl font-bold mb-2 ${
                missedDeadlines > 0 ? "text-red-600" : "text-gray-400"
              }`}
            >
              {missedDeadlines}
            </div>
            <div className="text-gray-600 text-sm font-medium">
              Missed Deadlines
            </div>
          </Container>
        </div>

        {/* Detailed Stats */}
        <Container variant="card">
          <h2 className="text-xl font-bold text-cyan-900 mb-4">
            Work Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Not Started */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-lg font-semibold text-gray-700">
                  Not Started
                </div>
                <div className="text-sm text-gray-500">Ready to begin</div>
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {subtaskStats?.notStarted || 0}
              </div>
            </div>

            {/* In Progress */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="text-lg font-semibold text-blue-700">
                  In Progress
                </div>
                <div className="text-sm text-blue-500">Currently working</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {subtaskStats?.inProgress || 0}
              </div>
            </div>

            {/* Completed */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="text-lg font-semibold text-green-700">
                  Completed
                </div>
                <div className="text-sm text-green-500">Finished tasks</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {subtaskStats?.completed || 0}
              </div>
            </div>
          </div>
        </Container>

        {/* Quick Actions */}
        <Container variant="card">
          <h2 className="text-xl font-bold text-cyan-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/projects"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg hover:from-green-600 hover:to-cyan-600 transition"
            >
              <div>
                <div className="font-semibold">View My Projects</div>
                <div className="text-sm opacity-90">
                  See projects you're assigned to
                </div>
              </div>
              <div className="text-2xl">→</div>
            </a>

            <a
              href="/kanban"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
            >
              <div>
                <div className="font-semibold">My Task Board</div>
                <div className="text-sm opacity-90">
                  Manage all your subtasks
                </div>
              </div>
              <div className="text-2xl">→</div>
            </a>
          </div>
        </Container>
      </div>
    </div>
  );
}
