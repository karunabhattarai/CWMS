import { useMemo, useState } from "react";
import { FrappeGantt, ViewMode } from "frappe-gantt-react";

function mapSubtasksToGantt(subtasks) {
  return subtasks.map((st) => ({
    id: st._id,
    name: st.name,
    start: st.earliestStart
      ? new Date(st.earliestStart).toISOString().split("T")[0]
      : st.startedAt
      ? new Date(st.startedAt).toISOString().split("T")[0]
      : st.createdAt
      ? new Date(st.createdAt).toISOString().split("T")[0]
      : st.deadline
      ? new Date(st.deadline).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    end: st.earliestFinish
      ? new Date(st.earliestFinish).toISOString().split("T")[0]
      : st.deadline
      ? new Date(st.deadline).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    progress:
      st.status === "Completed" ? 100 : st.status === "In Progress" ? 50 : 0,
    dependencies:
      st.dependencies && st.dependencies.length
        ? st.dependencies
            .map((dep) => (typeof dep === "object" ? dep.toString() : dep))
            .join(",")
        : "",
    custom_class: st.isCritical ? "gantt-critical-task" : "",
  }));
}

export default function GanttTab({ subtasks }) {
  const tasks = useMemo(() => mapSubtasksToGantt(subtasks), [subtasks]);
  const [viewMode, setViewMode] = useState(ViewMode.Day);

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex gap-2 mb-4">
        {Object.values(ViewMode).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 rounded ${
              viewMode === mode
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      <FrappeGantt tasks={tasks} viewMode={viewMode} onClick={(task) => {}} />
    </div>
  );
}
