// src/pages/DashboardPage.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";

const demoProjects = [
  {
    id: "1",
    name: "TNC Townhall",
    status: "In Progress",
    progress: 60,
    team: [{ name: "Alice" }, { name: "Bob" }],
    subparts: [
      { id: "s1", name: "Preparation", status: "Done" },
      { id: "s2", name: "Execution", status: "In Progress" },
      { id: "s3", name: "Review", status: "Planned" },
    ],
  },
  {
    id: "2",
    name: "Brand Redesign",
    status: "Planned",
    progress: 0,
    team: [{ name: "Carol" }],
    subparts: [{ id: "s1", name: "Brief", status: "Planned" }],
  },
];

const statusStyles = {
  Planned: "bg-green-100 text-gray-600 border border-gray-200",
  "In Progress": "bg-green-200 text-gray-800 border border-gray-300",
  Review: "bg-green-100 text-gray-500 border border-gray-200",
  Completed: "bg-green-100 text-green-700 border border-green-200",
  Done: "bg-green-100 text-green-700 border border-green-200",
};

export default function DashboardPage() {
  const [projects] = useState(demoProjects);

  return (
    <div className="w-full px-4 py-10 bg-cyan-50">
      <h1 className="text-3xl font-bold font-serif text-gray-900 mb-8 text-center">
        Your Projects
      </h1>

      <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md transition cursor-pointer"
            onClick={() => (window.location.href = `/projects/${project.id}`)}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-serif text-gray-900">
                {project.name}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  statusStyles[project.status]
                }`}
              >
                {project.status}
              </span>
            </div>

            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {project.progress}% complete
              </div>
            </div>

            <div className="flex -space-x-2">
              {project.team.map((member, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-gray-100 text-gray-700 font-bold text-sm"
                  title={member.name}
                >
                  {member.name[0]}
                </div>
              ))}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Subparts
              </div>
              <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                {project.subparts.map((sub) => (
                  <li key={sub.id}>
                    {sub.name}
                    <span className="ml-1 text-gray-400">({sub.status})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-white">
          <button className="text-gray-500 hover:text-gray-800 px-6 py-4 font-bold text-lg">
            + New Project
          </button>
        </div>
      </div>

      <div className="mt-10 text-center text-gray-400 text-sm">
        Click a project card to see task-level progress.
      </div>
    </div>
  );
}
