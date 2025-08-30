import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

export default function SubtaskDetailPage() {
  const { subtaskId } = useParams();
  const [subtask, setSubtask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSubtask = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_BASE}/api/subtask/${subtaskId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSubtask(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch subtask details"
        );
        showToast(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch subtask details",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubtask();
  }, [subtaskId, API_BASE, showToast]);

  // Render different attachment types
  const renderAttachment = (attachment) => {
    switch (attachment.type) {
      case "photo":
        return (
          <div className="mb-4">
            <img
              src={attachment.url}
              alt="Attachment"
              className="max-h-64 rounded border border-gray-200"
            />
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline block mt-1"
            >
              Open full image
            </a>
          </div>
        );
      case "pdf":
        return (
          <div className="mb-4 flex items-center p-3 bg-gray-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500 mr-3"
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
              <span className="block text-gray-800 font-medium">
                PDF Document
              </span>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Open PDF
              </a>
            </div>
          </div>
        );
      case "link":
        return (
          <div className="mb-4 flex items-center p-3 bg-gray-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500 mr-3"
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
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {attachment.url}
            </a>
          </div>
        );
      default:
        return (
          <div className="mb-4">
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {attachment.url}
            </a>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
        <p className="text-xl font-bold mb-4">{error}</p>
        <Link to="/dashboard" className="text-green-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!subtask) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
        <p className="text-xl font-bold mb-4">Subtask not found</p>
        <Link to="/dashboard" className="text-green-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          to={`/projects/${subtask.task._id}`}
          className="text-green-700 hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Project: {subtask.task.name}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {subtask.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Details</h2>
            <div className="space-y-2">
              <p>
                <span className="text-gray-600">Status:</span>{" "}
                <span className="font-medium">{subtask.status}</span>
              </p>
              <p>
                <span className="text-gray-600">Assigned to:</span>{" "}
                <span className="text-green-700 font-medium">
                  {subtask.assignedMember?.name || "Unassigned"}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Duration:</span>{" "}
                {subtask.estimatedDurationDays || 0} day(s)
              </p>
              {subtask.startedAt && (
                <p>
                  <span className="text-gray-600">Started:</span>{" "}
                  {new Date(subtask.startedAt).toLocaleDateString()}
                </p>
              )}
              {subtask.completedAt && (
                <p>
                  <span className="text-gray-600">Completed:</span>{" "}
                  {new Date(subtask.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Schedule</h2>
            <div className="space-y-2">
              {subtask.earliestStart && (
                <p>
                  <span className="text-gray-600">Earliest Start:</span>{" "}
                  {new Date(subtask.earliestStart).toLocaleDateString()}
                </p>
              )}
              {subtask.earliestFinish && (
                <p>
                  <span className="text-gray-600">Earliest Finish:</span>{" "}
                  {new Date(subtask.earliestFinish).toLocaleDateString()}
                </p>
              )}
              {subtask.latestStart && (
                <p>
                  <span className="text-gray-600">Latest Start:</span>{" "}
                  {new Date(subtask.latestStart).toLocaleDateString()}
                </p>
              )}
              {subtask.latestFinish && (
                <p>
                  <span className="text-gray-600">Latest Finish:</span>{" "}
                  {new Date(subtask.latestFinish).toLocaleDateString()}
                </p>
              )}
              {subtask.isCritical !== undefined && (
                <p>
                  <span className="text-gray-600">Critical Path:</span>{" "}
                  {subtask.isCritical ? "Yes" : "No"}
                </p>
              )}
            </div>
          </div>
        </div>

        {subtask.comment && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {subtask.comment}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Dependencies</h2>
          {subtask.dependencies && subtask.dependencies.length > 0 ? (
            <ul className="list-disc pl-5">
              {subtask.dependencies.map((dep) => (
                <li key={dep._id}>
                  <Link
                    to={`/subtasks/${dep._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {dep.name}
                  </Link>
                  <span className="text-gray-500 text-sm ml-2">
                    ({dep.status})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No dependencies</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Attachments</h2>
          {subtask.attachments && subtask.attachments.length > 0 ? (
            <div className="space-y-4">
              {subtask.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {renderAttachment(attachment)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No attachments</p>
          )}
        </div>
      </div>
    </div>
  );
}
