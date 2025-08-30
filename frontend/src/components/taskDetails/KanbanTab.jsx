import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SubtaskModal from "./SubtaskModal";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

const STATUS = ["Not Started", "In Progress", "Completed", "Backlog"];

function getStatus(subtask) {
  // Use earliestFinish or latestFinish as the deadline
  const deadlineDate = subtask.earliestFinish
    ? new Date(subtask.earliestFinish)
    : subtask.latestFinish
    ? new Date(subtask.latestFinish)
    : null;

  const now = new Date();
  const isBacklog =
    deadlineDate && deadlineDate < now && subtask.status !== "Completed";

  if (subtask.status === "Completed") return "Completed";
  if (isBacklog) return "Backlog";
  if (subtask.status === "In Progress") return "In Progress";
  return "Not Started";
}

export default function KanbanTab({ subtasks: initialSubtasks }) {
  const [subtasks, setSubtasks] = useState(initialSubtasks);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const { showToast } = useToast();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setSubtasks(initialSubtasks);
  }, [initialSubtasks]);

  // We handle subtask updates through refreshSubtasks when modal closes

  // Refresh subtasks data from server
  const refreshSubtasks = async () => {
    try {
      if (!subtasks.length) return;

      const taskId = subtasks[0].task;
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE}/api/subtask/task/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubtasks(response.data);
    } catch (error) {
      console.error("Error refreshing subtasks:", error);
      showToast("Failed to refresh subtasks data. Please try again.", "error");
    }
  };

  const handleModalClose = () => {
    // Refresh subtasks when modal is closed to get latest data
    refreshSubtasks();
    setSelectedSubtask(null);
  };

  // Prepare columns
  const columns = STATUS.reduce((acc, stat) => ({ ...acc, [stat]: [] }), {});
  subtasks.forEach((s) => columns[getStatus(s)].push(s));

  // Drag and drop handler (optional for full drag logic)
  const onDragEnd = () => {};

  // Display attachment indicators
  const renderAttachmentIndicator = (subtask) => {
    if (!subtask.attachments || subtask.attachments.length === 0) return null;

    return (
      <div className="flex items-center mt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
        <span className="text-xs text-gray-500 ml-1">
          {subtask.attachments.length} attachment
          {subtask.attachments.length !== 1 ? "s" : ""}
        </span>
      </div>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS.map((stat) => (
          <div
            key={stat}
            className="w-72 min-w-[18rem] bg-gray-100 rounded-lg shadow p-2"
          >
            <h3 className="font-semibold text-lg mb-2 text-green-700">
              {stat}
            </h3>
            <Droppable droppableId={stat}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-2"
                >
                  {columns[stat].map((subtask, idx) => (
                    <Draggable
                      key={subtask._id}
                      draggableId={subtask._id}
                      index={idx}
                    >
                      {(draggableProvided) => (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                          className="bg-white rounded p-3 shadow-sm cursor-pointer hover:bg-green-100 transition"
                          onClick={() => setSelectedSubtask(subtask)}
                        >
                          <div className="font-semibold">{subtask.name}</div>
                          <div className="text-xs text-gray-600">
                            Due:{" "}
                            {subtask.earliestFinish
                              ? new Date(
                                  subtask.earliestFinish
                                ).toLocaleDateString()
                              : subtask.latestFinish
                              ? new Date(
                                  subtask.latestFinish
                                ).toLocaleDateString()
                              : "Unassigned"}
                          </div>
                          <div className="text-xs text-gray-600">
                            Assigned:{" "}
                            {subtask.assignedMember?.name || "Unassigned"}
                          </div>
                          {renderAttachmentIndicator(subtask)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
        {selectedSubtask && (
          <SubtaskModal subtask={selectedSubtask} onClose={handleModalClose} />
        )}
      </div>
    </DragDropContext>
  );
}
