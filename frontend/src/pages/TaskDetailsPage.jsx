import { useState } from "react";
import { useParams } from "react-router-dom";
import KanbanTab from "../components/taskDetails/KanbanTab";
import GanttTab from "../components/taskDetails/GanttTab";

import { tasks, subtasks } from "../dummyData";

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const task = tasks.find((t) => t._id === taskId);
  const relatedSubtasks = subtasks.filter((s) => s.task === taskId);

  const [activeTab, setActiveTab] = useState("kanban");

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
        </div>

        {activeTab === "kanban" ? (
          <KanbanTab subtasks={relatedSubtasks} />
        ) : (
          <GanttTab subtasks={relatedSubtasks} />
        )}
      </div>
    </div>
  );
}
