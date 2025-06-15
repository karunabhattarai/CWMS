// src/pages/ProjectsPage.jsx
import { useState, useMemo } from "react";
import {
  tasks as allTasks,
  taskTemplates as allTemplates,
  roles,
  members,
  subtasks as allSubtasks,
} from "../dummyData.jsx";
import ProjectList from "../components/projects/ProjectList";
import ProjectSearchFilter from "../components/projects/ProjectSearchFilter";
import ProjectModal from "../components/projects/ProjectModal";

const statusStyles = {
  completed: "bg-green-100 text-green-700 border border-green-200",
  inprogress: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
  delayed: "bg-rose-100 text-rose-700 border border-rose-200",
};

function getProjectStatusAndProgress(task, subtasks) {
  if (!task.subtasks?.length) return { status: "scheduled", progress: 0 };
  const total = task.subtasks.length;
  const completed = subtasks.filter(
    (s) => s.task === task._id && s.status === "completed"
  ).length;
  const delayed = subtasks.some(
    (s) => s.task === task._id && s.status === "delayed"
  );
  const inprogress = subtasks.some(
    (s) => s.task === task._id && s.status === "inprogress"
  );
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
  const [tasks, setTasks] = useState(allTasks);
  const [subtasks, setSubtasks] = useState(allSubtasks);
  const [templates, setTemplates] = useState(allTemplates);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Template creation form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    subtasks: [
      { name: "", estimatedDurationDays: 1, role: roles[0]?._id || "" },
    ],
  });
  const [templateFormError, setTemplateFormError] = useState("");

  // Search & filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (search.trim()) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => {
        const { status } = getProjectStatusAndProgress(task, subtasks);
        return status === statusFilter;
      });
    }
    filtered.sort((a, b) => {
      if (dateSort === "newest")
        return new Date(b.startDate) - new Date(a.startDate);
      if (dateSort === "oldest")
        return new Date(a.startDate) - new Date(b.startDate);
      return 0;
    });
    return filtered;
  }, [tasks, search, statusFilter, dateSort, subtasks]);

  function handleCreateTemplate(e) {
    e.preventDefault();
    if (!newTemplate.name.trim()) {
      setTemplateFormError("Template name is required.");
      return;
    }
    if (newTemplate.subtasks.length === 0) {
      setTemplateFormError("At least one subpart is required.");
      return;
    }
    for (const sub of newTemplate.subtasks) {
      if (!sub.name.trim() || !sub.estimatedDurationDays || !sub.role) {
        setTemplateFormError(
          "All subparts must have name, duration, and role."
        );
        return;
      }
    }
    const newId = "tpl" + (templates.length + 1);
    const tpl = {
      _id: newId,
      name: newTemplate.name,
      description: newTemplate.description,
      subtasks: newTemplate.subtasks.map((s, i) => ({
        ...s,
        _id: `${newId}-sub${i + 1}`,
      })),
    };
    setTemplates((prev) => [...prev, tpl]);
    setShowTemplateForm(false);
    setSelectedTemplateId(newId);
    setNewTemplate({
      name: "",
      description: "",
      subtasks: [
        { name: "", estimatedDurationDays: 1, role: roles[0]?._id || "" },
      ],
    });
    setTemplateFormError("");
  }

  function handleDeleteProject(taskId) {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  }
  function handleEditProject(taskId) {
    alert("Edit functionality coming soon!");
  }
  function handleViewProject(taskId) {
    window.location.href = `/projects/${taskId}`;
  }

  return (
    <div className="min-h-screen bg-cyan-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold font-serif text-green-900">
            All Projects
          </h1>
          <button
            className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition"
            onClick={() => setShowModal(true)}
          >
            + Start a New Project
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
        <ProjectList
          projects={filteredTasks}
          subtasks={subtasks}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onView={handleViewProject}
          statusStyles={statusStyles}
          getProjectStatusAndProgress={getProjectStatusAndProgress}
        />
      </div>
      <ProjectModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setShowTemplateForm(false);
        }}
        templates={templates}
        roles={roles}
        showTemplateForm={showTemplateForm}
        setShowTemplateForm={setShowTemplateForm}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId}
        newTemplate={newTemplate}
        setNewTemplate={setNewTemplate}
        templateFormError={templateFormError}
        handleCreateTemplate={handleCreateTemplate}
      />
    </div>
  );
}
