import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ProjectList from "../components/projects/ProjectList";
import ProjectSearchFilter from "../components/projects/ProjectSearchFilter";

const statusStyles = {
  completed: "bg-green-100 text-green-700 border border-green-200",
  inprogress: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
  delayed: "bg-rose-100 text-rose-700 border border-rose-200",
};

function getProjectStatusAndProgress(task) {
  if (!task.subtasks?.length) return { status: "scheduled", progress: 0 };
  const total = task.subtasks.length;
  const completed = task.subtasks.filter(
    (s) => s.status === "Completed"
  ).length;
  const delayed = task.subtasks.some((s) => s.status === "Delayed");
  const inprogress = task.subtasks.some((s) => s.status === "In Progress");
  if (completed === total) return { status: "completed", progress: 100 };
  if (delayed)
    return {
      status: "delayed",
      progress: Math.round((completed / total) * 100),
    };
  if (inprogress)
    return {
      status: "inprogress",
      progress: Math.round((completed / total) * 100),
    };
  return {
    status: "scheduled",
    progress: Math.round((completed / total) * 100),
  };
}

export default function ProjectsPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/api/task`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res.data);
        setTasks(res.data);
      } catch (e) {
        setError(
          e.response?.data?.message || e.message || "Failed to fetch projects"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  async function handleDeleteProject(taskId) {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await axios.delete(`${API_BASE}/api/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (e) {
      console.log(e);
      alert(
        e.response?.data?.message || e.message || "Failed to delete project"
      );
    }
  }

  function handleEditProject(taskId) {
    window.location.href = `/editproject/${taskId}`;
  }

  function handleViewProject(taskId) {
    window.location.href = `/projects/${taskId}`;
  }

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (search.trim()) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => {
        const { status } = getProjectStatusAndProgress(task);
        return status === statusFilter;
      });
    }
    filtered.sort((a, b) => {
      const ad = a.createdAt || a.deadline || 0;
      const bd = b.createdAt || b.deadline || 0;
      if (dateSort === "newest") return new Date(bd) - new Date(ad);
      if (dateSort === "oldest") return new Date(ad) - new Date(bd);
      return 0;
    });
    return filtered;
  }, [tasks, search, statusFilter, dateSort]);

  return (
    <div className="min-h-screen bg-[#efeee8] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold font-serif text-green-900">
            All Projects
          </h1>
          <button className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition">
            <a href="/createproject">+ Start a New Project</a>
          </button>
        </div>
        <ProjectSearchFilter
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateSort={dateSort}
          setDateSort={setDateSort}
        />
        {loading ? (
          <div className="text-center py-10 text-green-900 font-serif">
            Loading projects...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-700">{error}</div>
        ) : (
          <ProjectList
            projects={filteredTasks}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onView={handleViewProject}
            statusStyles={statusStyles}
            getProjectStatusAndProgress={getProjectStatusAndProgress}
          />
        )}
      </div>
    </div>
  );
}
