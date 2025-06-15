export default function ProjectCard({
  project,
  subtasks,
  onEdit,
  onDelete,
  onView,
  statusStyles,
  getProjectStatusAndProgress,
}) {
  const { status, progress } = getProjectStatusAndProgress(project, subtasks);

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 flex flex-col gap-4 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold font-serif text-green-900">
          {project.name}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>
      <div>
        <div className="w-full bg-green-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-green-700 mt-1">{progress}% complete</div>
      </div>
      <div className="text-xs text-green-700">
        Deadline:{" "}
        {project.deadline
          ? new Date(project.deadline).toLocaleDateString()
          : "N/A"}
      </div>
      <div className="flex -space-x-2">
        {(project.team || []).map((member, idx) => (
          <div
            key={idx}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-green-100 text-green-800 font-bold text-sm"
            title={member.name}
          >
            {member.name[0]}
          </div>
        ))}
      </div>
      <div>
        <div className="text-xs font-semibold text-green-800 mb-1">
          Subparts
        </div>
        <ul className="text-xs text-green-700 list-disc list-inside space-y-1">
          {(project.subparts || []).map((sub) => (
            <li key={sub.id || sub._id}>
              {sub.name}
              <span className="ml-1 text-green-400">({sub.status})</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold hover:bg-green-200 transition"
          onClick={() => onEdit(project._id)}
        >
          Edit
        </button>
        <button
          className="px-3 py-1 rounded bg-rose-100 text-rose-700 text-xs font-semibold hover:bg-rose-200 transition"
          onClick={() => onDelete(project._id)}
        >
          Delete
        </button>
        <button
          className="px-3 py-1 rounded bg-green-700 text-white text-xs font-semibold hover:bg-green-800 transition"
          onClick={() => onView(project._id)}
        >
          View
        </button>
      </div>
    </div>
  );
}
