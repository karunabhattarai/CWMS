import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SubtaskModal from "./SubtaskModal";

const STATUS = ["Not Started", "In Progress", "Completed", "Backlog"];

function getStatus(subtask) {
  const deadlineDate = subtask.deadline && new Date(subtask.deadline);
  const now = new Date();
  const isBacklog =
    deadlineDate && deadlineDate < now && subtask.status !== "Completed";

  console.log("Checking:", {
    name: subtask.name,
    deadline: subtask.deadline,
    deadlineDate,
    now,
    status: subtask.status,
    isBacklog,
  });

  if (subtask.status === "Completed") return "Completed";
  if (isBacklog) return "Backlog";
  if (subtask.status === "In Progress") return "In Progress";
  return "Not Started";
}

export default function KanbanTab({ subtasks }) {
  const [selectedSubtask, setSelectedSubtask] = useState(null);

  // Prepare columns
  const columns = STATUS.reduce((acc, stat) => ({ ...acc, [stat]: [] }), {});
  subtasks.forEach((s) => columns[getStatus(s)].push(s));

  // Drag and drop handler (optional for full drag logic)
  const onDragEnd = () => {};

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
                            {subtask.deadline
                              ? new Date(subtask.deadline).toLocaleDateString()
                              : "—"}
                          </div>
                          <div className="text-xs text-gray-600">
                            Assigned:{" "}
                            {subtask.assignedMember?.name || "Unassigned"}
                          </div>
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
          <SubtaskModal
            subtask={selectedSubtask}
            onClose={() => setSelectedSubtask(null)}
          />
        )}
      </div>
    </DragDropContext>
  );
}
