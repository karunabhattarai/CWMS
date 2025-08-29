import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "../hooks/useAuth";
import { Container, LoadingSpinner, ErrorMessage } from "../components/common";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const STATUS = ["Not Started", "In Progress", "Completed"];

// Project colors for visual distinction
const PROJECT_COLORS = [
  "bg-red-100 border-red-300 text-red-800",
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-yellow-100 border-yellow-300 text-yellow-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
  "bg-gray-100 border-gray-300 text-gray-800",
];

export default function EmployeeKanban() {
  const { user } = useAuth();
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Create project color mapping
  const [projectColors, setProjectColors] = useState({});

  useEffect(() => {
    const fetchSubtasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/api/employee/subtasks`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setSubtasks(response.data);

        // Create color mapping for projects
        const uniqueProjects = [
          ...new Set(response.data.map((s) => s.task?._id)),
        ];
        const colorMap = {};
        uniqueProjects.forEach((projectId, index) => {
          colorMap[projectId] = PROJECT_COLORS[index % PROJECT_COLORS.length];
        });
        setProjectColors(colorMap);
      } catch (error) {
        console.error("Error fetching subtasks:", error);
        setError(error.response?.data?.message || "Failed to load subtasks");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "employee") {
      fetchSubtasks();
    }
  }, [user]);

  // Organize subtasks by status
  const columns = STATUS.reduce(
    (acc, status) => ({ ...acc, [status]: [] }),
    {}
  );
  subtasks.forEach((subtask) => {
    columns[subtask.status].push(subtask);
  });

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE}/api/subtask/${draggableId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // Update local state
      setSubtasks((prev) =>
        prev.map((subtask) =>
          subtask._id === draggableId
            ? { ...subtask, status: newStatus }
            : subtask
        )
      );
    } catch (error) {
      console.error("Error updating subtask status:", error);
      setError("Failed to update subtask status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4 flex items-center justify-center">
        <LoadingSpinner text="Loading your task board..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4 flex items-center justify-center">
        <Container maxWidth="max-w-md">
          <ErrorMessage error={error} variant="card" />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Container variant="card">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-cyan-900 mb-2">
                My Task Board
              </h1>
              <p className="text-cyan-700">
                Manage all your assigned subtasks across projects
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {subtasks.length}
              </div>
              <div className="text-sm text-gray-600">Total Subtasks</div>
            </div>
          </div>
        </Container>

        {/* Legend */}
        <Container variant="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Project Color Legend:
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(projectColors).map(([projectId, colorClass]) => {
              const project = subtasks.find(
                (s) => s.task?._id === projectId
              )?.task;
              return (
                <div
                  key={projectId}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
                >
                  {project?.name || "Unknown Project"}
                </div>
              );
            })}
          </div>
        </Container>

        {/* Kanban Board */}
        {subtasks.length === 0 ? (
          <Container variant="card" className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Subtasks Assigned
            </h3>
            <p className="text-gray-500">
              You don't have any subtasks assigned yet.
            </p>
          </Container>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STATUS.map((status) => (
                <div key={status} className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-800">
                      {status}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                      {columns[status].length}
                    </span>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50"
                        }`}
                      >
                        {columns[status].map((subtask, index) => (
                          <Draggable
                            key={subtask._id}
                            draggableId={subtask._id}
                            index={index}
                            isDragDisabled={updating}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer transition-transform hover:shadow-md ${
                                  snapshot.isDragging
                                    ? "rotate-2 shadow-lg"
                                    : ""
                                }`}
                                onClick={() => setSelectedSubtask(subtask)}
                              >
                                <SubtaskCard
                                  subtask={subtask}
                                  projectColor={
                                    projectColors[subtask.task?._id]
                                  }
                                />
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
            </div>
          </DragDropContext>
        )}

        {/* Subtask Detail Modal */}
        {selectedSubtask && (
          <SubtaskDetailModal
            subtask={selectedSubtask}
            onClose={() => setSelectedSubtask(null)}
            projectColor={projectColors[selectedSubtask.task?._id]}
          />
        )}
      </div>
    </div>
  );
}

function SubtaskCard({ subtask, projectColor }) {
  return (
    <div className="space-y-2">
      {/* Project Tag */}
      <div
        className={`inline-block px-2 py-1 rounded text-xs font-medium border ${projectColor}`}
      >
        {subtask.task?.name || "Unknown Project"}
      </div>

      {/* Subtask Name */}
      <div className="font-semibold text-gray-900">{subtask.name}</div>

      {/* Duration */}
      <div className="text-xs text-gray-600">
        Duration: {subtask.estimatedDurationDays} day(s)
      </div>

      {/* Comment preview if available */}
      {subtask.comment && (
        <div className="text-xs text-gray-500 line-clamp-2">
          {subtask.comment}
        </div>
      )}
    </div>
  );
}

function SubtaskDetailModal({ subtask, onClose, projectColor }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">Subtask Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Project */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <div
              className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${projectColor}`}
            >
              {subtask.task?.name || "Unknown Project"}
            </div>
          </div>

          {/* Subtask Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtask Name
            </label>
            <div className="text-lg font-semibold text-gray-900">
              {subtask.name}
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                subtask.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : subtask.status === "In Progress"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {subtask.status}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration
            </label>
            <div className="text-gray-900">
              {subtask.estimatedDurationDays} day(s)
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments/Notes
            </label>
            <div className="text-gray-700 bg-gray-50 p-3 rounded-lg min-h-[60px]">
              {subtask.comment || "No comments yet..."}
            </div>
          </div>

          {/* Timestamps */}
          {(subtask.startedAt || subtask.completedAt) && (
            <div className="mb-4 space-y-2">
              {subtask.startedAt && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Started: </span>
                  <span className="text-gray-600">
                    {new Date(subtask.startedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {subtask.completedAt && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Completed: </span>
                  <span className="text-gray-600">
                    {new Date(subtask.completedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
