import { useMemo } from "react";
import { tasks, subtasks, members, roles } from "../dummyData.jsx";

// Helper to flatten all subtasks
function getAllSubtasks() {
  return subtasks.map((sub) => ({
    ...sub,
    project: tasks.find((t) => t._id === sub.task),
  }));
}

// Priority badge styling
const priorityStyles = {
  urgent: "bg-rose-100 text-rose-800 border border-rose-200",
  high: "bg-orange-100 text-orange-800 border border-orange-200",
  moderate: "bg-green-100 text-green-800 border border-green-200",
  low: "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function DashboardPage() {
  // KPI calculations
  const activeProjects = tasks.filter((t) => t.status !== "Completed").length;
  const tasksInProgress = subtasks.filter(
    (s) => s.status === "inprogress"
  ).length;
  const overdueSubtasks = getAllSubtasks().filter(
    (s) => new Date(s.deadline) < new Date() && s.status !== "completed"
  ).length;
  const teamMemberCount = members.length;

  // Upcoming deadlines (next 5)
  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter((t) => t.deadline && new Date(t.deadline) >= new Date())
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  }, []);

  // Project progress (top 3 by priority)
  const topProjects = useMemo(() => {
    const priorityOrder = { urgent: 3, high: 2, moderate: 1, low: 0 };
    return [...tasks]
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 3);
  }, []);

  return (
    <div className="w-full px-4 py-10 bg-cyan-50 min-h-screen">
      <h1 className="text-3xl font-bold font-serif text-gray-900 mb-8 text-center">
        Organizational Overview
      </h1>

      {/* KPI Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
        <KPI title="Active Projects" value={activeProjects} />
        <KPI title="Tasks In Progress" value={tasksInProgress} />
        <KPI title="Overdue Tasks" value={overdueSubtasks} />
        <KPI title="Team Members" value={teamMemberCount} />
      </div>

      {/* Priority Projects */}
      <div className="max-w-6xl mx-auto mb-10">
        <h2 className="text-lg font-bold text-green-900 mb-4">
          Priority Projects
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {topProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-xl shadow border border-green-100 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-green-900">
                  {project.name}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    priorityStyles[project.priority]
                  }`}
                >
                  {project.priority}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">Status:</span>
                <span className="capitalize">{project.status}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">Deadline:</span>
                <span>{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="max-w-6xl mx-auto mb-10">
        <h2 className="text-lg font-bold text-green-900 mb-4">
          Upcoming Deadlines
        </h2>
        <ul className="bg-white rounded-xl shadow border border-green-100 divide-y divide-green-50">
          {upcomingDeadlines.length === 0 && (
            <li className="p-4 text-green-700">No upcoming deadlines.</li>
          )}
          {upcomingDeadlines.map((task) => (
            <li
              key={task._id}
              className="p-4 flex items-center justify-between hover:bg-green-50"
            >
              <div>
                <span className="font-semibold">{task.name}</span>
              </div>
              <div className="text-xs text-green-700">
                {new Date(task.deadline).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Team Overview */}
      <div className="max-w-6xl mx-auto mb-10">
        <h2 className="text-lg font-bold text-green-900 mb-4">Team Members</h2>
        <div className="flex flex-wrap gap-4">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex flex-col items-center bg-white rounded-xl shadow border border-green-100 p-4 w-32"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-xl mb-2">
                {member.name[0]}
              </div>
              <div className="text-green-900 font-semibold text-sm text-center">
                {member.name}
              </div>
              <div className="text-xs text-green-600 text-center">
                {roles.find((r) => r._id === member.roles[0])?.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/createProject"
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold text-lg text-center transition"
        >
          + New Project
        </a>
        <a
          href="/projects"
          className="bg-green-100 hover:bg-green-200 text-green-900 px-6 py-3 rounded-xl font-bold text-lg text-center transition"
        >
          View All Projects
        </a>
      </div>
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 flex flex-col items-center">
      <div className="text-3xl font-bold text-green-700 mb-2">{value}</div>
      <div className="text-green-900 font-semibold">{title}</div>
    </div>
  );
}
