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
  const [selectedTask, setSelectedTask] = useState(null);

  const handleTaskClick = (task) => {
    const originalSubtask = subtasks.find((s) => s._id === task.id);
    if (originalSubtask) {
      setSelectedTask(originalSubtask);
    }
  };

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
      <FrappeGantt
        tasks={tasks}
        viewMode={viewMode}
        onClick={handleTaskClick}
      />

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">{selectedTask.name}</h2>
            <p className="text-sm text-gray-600 mb-4">
              Click the button below to open this subtask's details
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2"
              >
                Close
              </button>
              <button
                onClick={() =>
                  (window.location.href = `/subtasks/${selectedTask._id}`)
                }
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
