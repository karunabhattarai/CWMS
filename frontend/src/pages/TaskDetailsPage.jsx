import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import KanbanTab from "../components/taskDetails/KanbanTab";
import GanttTab from "../components/taskDetails/GanttTab";

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refresh

  // Check if user can access Kanban tab (only managers and superadmins)
  const canAccessKanban =
    user && (user.role === "manager" || user.role === "superadmin");

  // Get initial tab from URL query params or default based on access
  const getInitialTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get("tab");

    // If user can't access kanban, force gantt tab
    if (!canAccessKanban) {
      return "gantt";
    }

    // Only allow valid tab values
    if (tabFromUrl === "kanban" || tabFromUrl === "gantt") {
      return tabFromUrl;
    }
    return "kanban";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  // Refresh function is used directly in the button onClick

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch the task
        const taskRes = await axios.get(`${API_BASE}/api/task/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch subtasks for this task
        const subtasksRes = await axios.get(
          `${API_BASE}/api/subtask/task/${taskId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTask(taskRes.data);
        setSubtasks(subtasksRes.data);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, API_BASE, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl font-bold">
        {error}
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl font-bold">
        Task not found
      </div>
    );
  }

  return (
    <div className="bg-[#efeee8] min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-green-900 font-serif">
          {task.name}
        </h1>
        <div className="flex border-b mb-4">
          {canAccessKanban && (
            <button
              className={`py-2 px-4 rounded-t-lg ${
                activeTab === "kanban"
                  ? "bg-white text-green-800 font-bold"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("kanban")}
            >
              Kanban
            </button>
          )}
          <button
            className={`py-2 px-4 rounded-t-lg ${
              activeTab === "gantt"
                ? "bg-white text-green-800 font-bold"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("gantt")}
          >
            Gantt Chart
          </button>
          <button
            className="ml-auto py-1 px-3 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
            onClick={() => setRefreshKey((prev) => prev + 1)}
          >
            Refresh
          </button>
        </div>
        {activeTab === "kanban" && canAccessKanban ? (
          <KanbanTab subtasks={subtasks} />
        ) : (
          <GanttTab subtasks={subtasks} />
        )}
      </div>
    </div>
  );
}
