import { useState } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";

export default function SubtaskModal({ subtask, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [attachmentType, setAttachmentType] = useState("link");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [updatedSubtask, setUpdatedSubtask] = useState(subtask);
  const { showToast } = useToast();
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Check if current user is assigned to this subtask or is a manager/superadmin
  const isAssignedMember =
    user &&
    subtask.assignedMember &&
    user.member === subtask.assignedMember._id;

  const isManager =
    user && (user.role === "manager" || user.role === "superadmin");

  const canEditAttachments = isAssignedMember || isManager;

  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    if (file.size > maxSize) {
      showToast("File too large. Maximum size is 5MB.", "error");
      return;
    }

    setFileUploading(true);

    // In a real app, you'd upload to a server or cloud storage
    // This is a mock implementation that creates data URLs
    try {
      // Create a data URL for demo purposes
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileType = file.type.includes("pdf") ? "pdf" : "photo";
        const fileUrl = event.target.result;

        // In a real app, you'd send the file to your server and get back a URL
        // For now, we'll use this data URL
        setAttachmentUrl(fileUrl);
        setAttachmentType(fileType);
        setFileUploading(false);
      };

      reader.readAsDataURL(file);
    } catch {
      showToast("Failed to process file. Please try again.", "error");
      setFileUploading(false);
    }
  };

  const validateAttachment = () => {
    if (!attachmentUrl.trim()) {
      showToast("Please enter a valid URL.", "error");
      return false;
    }

    if (attachmentType === "link" && !attachmentUrl.match(/^https?:\/\//i)) {
      setAttachmentUrl(`https://${attachmentUrl}`);
    }

    return true;
  };

  const addAttachment = async () => {
    if (!validateAttachment()) return;

    try {
      const token = localStorage.getItem("token");
      const updatedAttachments = [
        ...(updatedSubtask.attachments || []),
        { url: attachmentUrl, type: attachmentType },
      ];

      const response = await axios.patch(
        `${API_BASE}/api/subtask/${subtask._id}`,
        { attachments: updatedAttachments },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUpdatedSubtask(response.data);
      setAttachmentUrl("");
      setAttachmentType("link");
      showToast("Attachment added successfully", "success");
    } catch (error) {
      console.error("Error adding attachment:", error);
      showToast(
        error.response?.data?.message || "Failed to add attachment",
        "error"
      );
    }
  };

  const removeAttachment = async (index) => {
    try {
      const token = localStorage.getItem("token");
      const updatedAttachments = [...(updatedSubtask.attachments || [])];
      updatedAttachments.splice(index, 1);

      const response = await axios.patch(
        `${API_BASE}/api/subtask/${subtask._id}`,
        { attachments: updatedAttachments },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUpdatedSubtask(response.data);
      showToast("Attachment removed successfully", "success");
    } catch (error) {
      console.error("Error removing attachment:", error);
      showToast(
        error.response?.data?.message || "Failed to remove attachment",
        "error"
      );
    }
  };

  // Display attachment based on type
  const renderAttachment = (attachment, index) => {
    switch (attachment.type) {
      case "photo":
        return (
          <div className="relative group">
            <img
              src={attachment.url}
              alt="Attachment"
              className="max-h-40 rounded border border-gray-200"
            />
            <div className="flex mt-1">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-xs hover:underline mr-2"
              >
                Open in new tab
              </a>
              {canEditAttachments && (
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-600 text-xs hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        );
      case "pdf":
        return (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <div>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                PDF Document
              </a>
              {canEditAttachments && (
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-600 text-xs hover:underline ml-2"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        );
      case "link":
        return (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <div>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {attachment.url.length > 30
                  ? attachment.url.substring(0, 30) + "..."
                  : attachment.url}
              </a>
              {canEditAttachments && (
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-600 text-xs hover:underline ml-2"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div>
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {attachment.url}
            </a>
            {canEditAttachments && (
              <button
                onClick={() => removeAttachment(index)}
                className="text-red-600 text-xs hover:underline ml-2"
              >
                Remove
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded p-6 shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-2">{updatedSubtask.name}</h2>
        <div className="mb-2">
          Description:{" "}
          <span className="text-gray-700">{updatedSubtask.comment || "—"}</span>
        </div>
        <div className="mb-2">
          Assigned to:{" "}
          <span className="text-green-700">
            {updatedSubtask.assignedMember?.name || "Unassigned"}
          </span>
        </div>
        <div className="mb-2">
          Status: <span className="font-medium">{updatedSubtask.status}</span>
        </div>
        <div className="mb-2">
          Deadline:{" "}
          <span>
            {updatedSubtask.earliestFinish
              ? new Date(updatedSubtask.earliestFinish).toLocaleDateString()
              : updatedSubtask.latestFinish
              ? new Date(updatedSubtask.latestFinish).toLocaleDateString()
              : "—"}
          </span>
        </div>
        <div className="mb-2">
          Duration:{" "}
          <span>
            {updatedSubtask.estimatedDurationDays
              ? `${updatedSubtask.estimatedDurationDays} day${
                  updatedSubtask.estimatedDurationDays !== 1 ? "s" : ""
                }`
              : "—"}
          </span>
        </div>
        {updatedSubtask.startedAt && (
          <div className="mb-2">
            Started At:{" "}
            <span>
              {new Date(updatedSubtask.startedAt).toLocaleDateString()}
            </span>
          </div>
        )}
        {updatedSubtask.completedAt && (
          <div className="mb-2">
            Completed At:{" "}
            <span>
              {new Date(updatedSubtask.completedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Attachments Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Attachments</h3>
            {canEditAttachments && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-green-700 hover:text-green-900 hover:underline"
              >
                {isEditing ? "Done" : "Add Attachment"}
              </button>
            )}
          </div>

          {/* Attachment List */}
          {updatedSubtask.attachments?.length > 0 ? (
            <div className="mt-3 space-y-3">
              {updatedSubtask.attachments.map((att, idx) => (
                <div key={idx} className="p-2 border border-gray-200 rounded">
                  {renderAttachment(att, idx)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              No attachments added yet.
            </p>
          )}
        </div>

        {/* Add Attachment UI */}
        {canEditAttachments && isEditing && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Add New Attachment</h4>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setAttachmentType("link")}
                className={`px-3 py-1 rounded text-sm ${
                  attachmentType === "link"
                    ? "bg-green-700 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Link
              </button>
              <button
                onClick={() => setAttachmentType("photo")}
                className={`px-3 py-1 rounded text-sm ${
                  attachmentType === "photo"
                    ? "bg-green-700 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Photo
              </button>
              <button
                onClick={() => setAttachmentType("pdf")}
                className={`px-3 py-1 rounded text-sm ${
                  attachmentType === "pdf"
                    ? "bg-green-700 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                PDF
              </button>
            </div>

            {attachmentType === "link" ? (
              <div className="mb-3">
                <input
                  type="text"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="Enter URL (e.g., https://example.com)"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            ) : (
              <div className="mb-3">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={attachmentType === "pdf" ? ".pdf" : "image/*"}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max file size: 5MB.
                  {attachmentType === "photo"
                    ? " Supported formats: JPG, PNG, GIF."
                    : " PDF files only."}
                </p>
                {fileUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full animate-pulse"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1">Uploading...</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={addAttachment}
                disabled={!attachmentUrl || fileUploading}
                className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Attachment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
