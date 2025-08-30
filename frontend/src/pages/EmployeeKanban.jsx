import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "../hooks/useAuth";
import { Container, LoadingSpinner, ErrorMessage } from "../components/common";
import { uploadFile, formatFileSize, isValidFileType, getFileType } from "../utils/fileUpload";
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
  const [attachmentModal, setAttachmentModal] = useState(null); // For completion attachment modal

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
    const originalStatus = source.droppableId;

    // Check if moving to "Completed" - if so, open attachment modal
    if (newStatus === "Completed" && originalStatus === "In Progress") {
      const subtask = subtasks.find(s => s._id === draggableId);
      setAttachmentModal({
        subtask,
        newStatus,
        originalStatus
      });
      return; // Don't update status yet, wait for attachment modal
    }

    // For other status changes, proceed normally
    await updateSubtaskStatus(draggableId, newStatus, originalStatus);
  };

  const updateSubtaskStatus = async (draggableId, newStatus, originalStatus, attachments = null) => {
    // Optimistically update the UI first
    setSubtasks((prev) =>
      prev.map((subtask) =>
        subtask._id === draggableId
          ? { ...subtask, status: newStatus }
          : subtask
      )
    );

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const updateData = { status: newStatus };
      if (attachments) {
        updateData.attachments = attachments;
      }

      await axios.put(
        `${API_BASE}/api/subtask/${draggableId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // If successful, the optimistic update is already done
    } catch (error) {
      console.error("Error updating subtask status:", error);
      
      // Revert the optimistic update on any error
      setSubtasks((prev) =>
        prev.map((subtask) =>
          subtask._id === draggableId
            ? { ...subtask, status: originalStatus }
            : subtask
        )
      );
      
      // Don't show any frontend alerts - let the backend WebSocket alerts handle this
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
                                
                                {/* Show attachment preview for completed tasks */}
                                {subtask.status === 'Completed' && subtask.attachments && subtask.attachments.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-xs font-medium text-gray-600 mb-1">
                                      Attachments:
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {subtask.attachments.slice(0, 3).map((attachment, idx) => (
                                        <div 
                                          key={idx}
                                          className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded text-xs border"
                                          title={attachment.fileName || attachment.url}
                                        >
                                          <span className="text-xs">
                                            {attachment.type === 'photo' ? '📷' : 
                                             attachment.type === 'pdf' ? '📄' : '🔗'}
                                          </span>
                                          <span className="truncate max-w-16">
                                            {attachment.fileName || 'File'}
                                          </span>
                                        </div>
                                      ))}
                                      {subtask.attachments.length > 3 && (
                                        <div className="flex items-center text-xs text-gray-500">
                                          +{subtask.attachments.length - 3} more
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
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

        {/* Attachment Modal for Completion */}
        {attachmentModal && (
          <AttachmentModal
            subtask={attachmentModal.subtask}
            onClose={() => setAttachmentModal(null)}
            onComplete={async (attachments) => {
              await updateSubtaskStatus(
                attachmentModal.subtask._id,
                attachmentModal.newStatus,
                attachmentModal.originalStatus,
                attachments
              );
              setAttachmentModal(null);
            }}
            projectColor={projectColors[attachmentModal.subtask.task?._id]}
          />
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
  const hasIncompleteDependencies = subtask.dependencies && 
    subtask.dependencies.length > 0 && 
    subtask.dependencies.some(dep => dep.status !== 'Completed') &&
    subtask.status === 'Not Started';

  const hasAttachments = subtask.attachments && subtask.attachments.length > 0;

  return (
    <div className="space-y-2">
      {/* Project Tag */}
      <div
        className={`inline-block px-2 py-1 rounded text-xs font-medium border ${projectColor}`}
      >
        {subtask.task?.name || "Unknown Project"}
      </div>

      {/* Subtask Name */}
      <div className="font-semibold text-gray-900 text-left">{subtask.name}</div>

      {/* Dependencies Warning */}
      {hasIncompleteDependencies && (
        <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 scale-80 text-left">
          <span>Dependencies pending</span>
        </div>
      )}

      {/* Attachments Indicator for Completed Tasks */}
      {subtask.status === 'Completed' && hasAttachments && (
        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-1 py-0.5 rounded border border-green-200 scale-80 text-left">
          <span>📎 {subtask.attachments.length} attachment{subtask.attachments.length > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="text-xs text-gray-600 text-left">
        Duration: {subtask.estimatedDurationDays} day(s)
      </div>
      {subtask.comment && (
        <div className="text-xs text-gray-500 line-clamp-2">
          {subtask.comment}
        </div>
      )}
    </div>
  );
}

function SubtaskDetailModal({ subtask, onClose, projectColor }) {
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editedComment, setEditedComment] = useState(subtask.comment || '');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  const handleSaveComment = async () => {
    setIsUpdatingComment(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/subtask/${subtask._id}`,
        { comment: editedComment },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      // Update the local subtask object
      subtask.comment = editedComment;
      setIsEditingComment(false);
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedComment(subtask.comment || '');
    setIsEditingComment(false);
  };

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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Comments/Notes
              </label>
              {!isEditingComment && (
                <button
                  onClick={() => setIsEditingComment(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ✏️ Edit
                </button>
              )}
            </div>
            {isEditingComment ? (
              <div className="space-y-2">
                <textarea
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[80px] resize-none"
                  placeholder="Add your comments or notes here..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveComment}
                    disabled={isUpdatingComment}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-green-400"
                  >
                    {isUpdatingComment ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdatingComment}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 bg-gray-50 p-3 rounded-lg min-h-[60px] cursor-pointer hover:bg-gray-100 transition-colors"
                   onClick={() => setIsEditingComment(true)}>
                {subtask.comment || "No comments yet... Click to add"}
              </div>
            )}
          </div>

          {/* Dependencies */}
          {subtask.dependencies && subtask.dependencies.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dependencies
              </label>
              <div className="space-y-2">
                {subtask.dependencies.map((dep) => (
                  <div
                    key={dep._id || dep.id}
                    className={`flex items-center justify-between p-2 rounded border text-sm ${
                      dep.status === 'Completed'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <span>{dep.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      dep.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : dep.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {subtask.attachments && subtask.attachments.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments ({subtask.attachments.length})
              </label>
              <div className="space-y-2">
                {subtask.attachments.map((attachment, index) => (
                  <AttachmentItem 
                    key={index} 
                    attachment={attachment} 
                    showDownload={true}
                  />
                ))}
              </div>
            </div>
          )}

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

function AttachmentModal({ subtask, onClose, onComplete, projectColor }) {
  const [attachments, setAttachments] = useState(subtask.attachments || []);
  const [newAttachment, setNewAttachment] = useState({ url: '', type: 'link' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const fileInputRef = useRef(null);

  const addAttachment = () => {
    if (!newAttachment.url.trim()) return;
    
    setAttachments([...attachments, { ...newAttachment }]);
    setNewAttachment({ url: '', type: 'link' });
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // File upload handling
  const handleFileSelect = async (files) => {
    const token = localStorage.getItem("token");
    
    for (const file of files) {
      if (!isValidFileType(file)) {
        alert(`File type ${file.type} is not supported. Please upload images or PDF files.`);
        continue;
      }

      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        alert(`File ${file.name} is too large. Maximum size is 25MB.`);
        continue;
      }

      try {
        const uploadResult = await uploadFile(file, token);
        
        setAttachments(prev => [...prev, {
          url: uploadResult.url,
          type: uploadResult.type,
          fileName: uploadResult.originalName,
          fileSize: uploadResult.size
        }]);
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
  };

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'photo';
    if (file.type === 'application/pdf') return 'pdf';
    return null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(files);
    e.target.value = ''; // Reset input
  };

  const handleComplete = async (skipAttachments = false) => {
    setIsSubmitting(true);
    try {
      const finalAttachments = skipAttachments ? subtask.attachments || [] : attachments;
      await onComplete(finalAttachments);
    } catch (error) {
      console.error('Error completing subtask:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'photo': return '📷';
      case 'pdf': return '📄';
      case 'link': return '🔗';
      default: return '📎';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Complete Subtask</h2>
              <p className="text-sm text-gray-600">Add attachments before marking as completed</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Subtask Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${projectColor} mb-2`}>
              {subtask.task?.name || "Unknown Project"}
            </div>
            <div className="font-semibold text-gray-900">{subtask.name}</div>
          </div>

          {/* Existing Attachments */}
          {attachments.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments ({attachments.length})
              </label>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <AttachmentItem 
                    key={index} 
                    attachment={attachment} 
                    showDownload={true}
                    showRemove={true}
                    onRemove={() => removeAttachment(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add New Attachment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Attachment
            </label>
            
            {/* Upload Mode Toggle */}
            <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  uploadMode === 'file' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📁 Upload File
              </button>
              <button
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  uploadMode === 'url' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🔗 Add URL
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-3">
                {/* Drag and Drop Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    dragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-3xl mb-2">📁</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Drag and drop files here, or click to browse
                  </div>
                  <div className="text-xs text-gray-500">
                    Supports: Images (JPG, PNG, GIF) and PDF files (Max: 25MB)
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <select
                    value={newAttachment.type}
                    onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="link">Link/URL</option>
                    <option value="photo">Photo URL</option>
                    <option value="pdf">PDF URL</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder={`Enter ${newAttachment.type} URL...`}
                    value={newAttachment.url}
                    onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addAttachment();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={addAttachment}
                  disabled={!newAttachment.url.trim()}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add URL Attachment
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleComplete(true)}
              disabled={isSubmitting}
              className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition font-medium disabled:bg-amber-400 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Completing...' : 'Skip & Complete'}
            </button>
            <button
              onClick={() => handleComplete(false)}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:bg-green-400 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Completing...' : `Complete${attachments.length > 0 ? ` (${attachments.length})` : ''}`}
            </button>
          </div>

          {/* Note */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              💡 <strong>Note:</strong> You can upload files (images, PDFs) or add URLs. Adding attachments helps document your completed work but is optional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttachmentItem({ attachment, showDownload = false, showRemove = false, onRemove }) {
  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'photo': return '📷';
      case 'pdf': return '📄';
      case 'link': return '🔗';
      default: return '📎';
    }
  };

  const handleDownload = () => {
    if (attachment.url.startsWith('data:')) {
      // For data URLs, create a blob and download
      try {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.fileName || `attachment.${attachment.type === 'photo' ? 'jpg' : 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download file');
      }
    } else {
      // For regular URLs, open in new tab
      window.open(attachment.url, '_blank');
    }
  };

  const handleView = () => {
    if (attachment.type === 'photo' || attachment.type === 'pdf') {
      // Open in new tab for viewing
      window.open(attachment.url, '_blank');
    } else {
      // For links, navigate to the URL
      window.open(attachment.url, '_blank');
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
      {/* Preview or Icon */}
      <div className="flex-shrink-0">
        {attachment.type === 'photo' && attachment.url.startsWith('data:') ? (
          <img 
            src={attachment.url} 
            alt="Preview" 
            className="w-10 h-10 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
            onClick={handleView}
            title="Click to view full size"
          />
        ) : (
          <span className="text-xl">{getAttachmentIcon(attachment.type)}</span>
        )}
      </div>
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {attachment.fileName || `${attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1)} file`}
        </div>
        <div className="text-xs text-gray-500">
          {attachment.url.startsWith('data:') ? (
            <div className="flex items-center gap-2">
              <span>Uploaded file</span>
              {attachment.fileSize && (
                <span className="text-gray-400">({formatFileSize(attachment.fileSize)})</span>
              )}
            </div>
          ) : (
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all"
              title="Open in new tab"
            >
              {attachment.url.length > 50 ? 
                `${attachment.url.substring(0, 50)}...` : 
                attachment.url
              }
            </a>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* View/Open Button */}
        <button
          onClick={handleView}
          className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
          title={attachment.type === 'link' ? 'Open link' : 'View file'}
        >
          {attachment.type === 'link' ? '🔗' : 'view'}
        </button>

        {/* Download Button */}
        {showDownload && (
          <button
            onClick={handleDownload}
            className="text-green-600 hover:text-green-800 p-1.5 rounded hover:bg-green-50 transition-colors"
            title="Download"
          >
            ⬇️
          </button>
        )}

        {/* Remove Button */}
        {showRemove && onRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
            title="Remove attachment"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
