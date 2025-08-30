import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import axios from "axios";

const DeadlineConfirmation = () => {
  const { subtaskId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, loading: authLoading, user } = useAuth();

  const [subtask, setSubtask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const action = searchParams.get("action");

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log("DeadlineConfirmation mounted with:", { subtaskId, action });
    console.log("Auth state:", {
      authLoading,
      token: token ? "exists" : "missing",
      user: user ? "exists" : "missing",
    });
    console.log(
      "Token from localStorage:",
      localStorage.getItem("token") ? "exists" : "missing"
    );

    // Wait for auth to load
    if (authLoading) {
      console.log("Auth still loading, waiting...");
      return;
    }

    if (action !== "confirm_completion") {
      console.log("Invalid action, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }

    // Check authentication - try both useAuth token and localStorage as fallback
    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      console.log("No auth token found, redirecting to login");
      navigate("/login", { replace: true });
      return;
    }

    console.log("Auth validated, fetching subtask details");
    fetchSubtaskDetails();
  }, [subtaskId, action, token, authLoading, user]);

  const fetchSubtaskDetails = async () => {
    try {
      console.log("Fetching subtask details for:", subtaskId);

      // Use token from useAuth or fallback to localStorage
      const authToken = token || localStorage.getItem("token");
      console.log("Using auth token:", authToken ? "Token exists" : "No token");

      const response = await axios.get(
        `http://localhost:5000/api/subtask/${subtaskId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Subtask data received:", response.data);
      setSubtask(response.data);

      // After getting subtask details, check if user has already responded
      await checkExistingResponse(authToken);

      setError(null);
    } catch (error) {
      console.error("Error fetching subtask:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (
        error.code === "ERR_NETWORK" ||
        error.message.includes("Network Error")
      ) {
        setError(
          "Network connection error. Please check your internet connection and try again."
        );
      } else if (error.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        setError(
          "Access denied. You do not have permission to view this subtask."
        );
      } else if (error.response?.status === 404) {
        setError("Subtask not found.");
      } else {
        setError(
          `Failed to fetch subtask details: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const checkExistingResponse = async (authToken) => {
    try {
      console.log("Checking for existing response...");

      const response = await axios.get(
        `http://localhost:5000/api/deadline/response-status/${subtaskId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.hasResponded) {
        // User already responded
        console.log("User has already responded to this deadline");
        const previousResponse = response.data.previousResponse;
        const respondedAt = new Date(
          response.data.respondedAt
        ).toLocaleString();

        setResponse({
          success: false,
          message: `You have already responded to this deadline alert on ${respondedAt}. Your previous response was: "${previousResponse}"`,
          isAlreadyResponded: true,
        });

        // Redirect to dashboard after 5 seconds for already responded case
        timeoutRef.current = setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 5000);
      } else {
        console.log("No existing response found - user can respond");
      }
    } catch (error) {
      // Error checking response status - log but don't block the form
      console.error("Error checking existing response:", error);
      // Don't set any error state here - let user try to respond normally
    }
  };

  const handleResponse = async (canComplete) => {
    setSubmitting(true);
    try {
      console.log("Submitting deadline response:", { subtaskId, canComplete });

      // Use token from useAuth or fallback to localStorage
      const authToken = token || localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/deadline/soft-deadline-response/${subtaskId}`,
        { canComplete },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response received:", response.data);

      setResponse({
        success: true,
        message: response.data.message,
        canComplete,
      });

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Redirect after 3 seconds
      timeoutRef.current = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 3000);
    } catch (error) {
      console.error("Error submitting response:", error);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (error.response?.status === 409) {
        // User already responded
        const previousResponse = error.response.data.previousResponse;
        const respondedAt = new Date(
          error.response.data.respondedAt
        ).toLocaleString();

        setResponse({
          success: false,
          message: `You have already responded to this deadline alert on ${respondedAt}. Your previous response was: "${previousResponse}"`,
          isAlreadyResponded: true,
        });

        // Redirect to dashboard after 5 seconds for already responded case
        timeoutRef.current = setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 5000);
      } else if (error.response?.status === 401) {
        setResponse({
          success: false,
          message: "Authentication failed. Please log in again.",
        });
        timeoutRef.current = setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        let errorMessage = "Network error occurred";

        if (
          error.code === "ERR_NETWORK" ||
          error.message.includes("Network Error")
        ) {
          errorMessage =
            "Network connection error. Please check your internet connection and try again.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setResponse({
          success: false,
          message: errorMessage,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subtask details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !subtask) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-t-4 border-red-500">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Error Loading Subtask
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            {error.includes("Authentication") ? (
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors mr-2"
              >
                Go to Login
              </button>
            ) : (
              <button
                onClick={fetchSubtaskDetails}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors mr-2"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => navigate("/dashboard", { replace: true })}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (response) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-t-4 border-green-600">
          {response.success ? (
            <>
              <div className="text-6xl mb-4">
                {response.canComplete ? "✅" : "⚠️"}
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Response Recorded!
              </h2>
              <p className="text-gray-600 mb-4">{response.message}</p>
              {!response.canComplete && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 text-sm">
                    Since you indicated you cannot complete on time, your
                    manager has been notified and will follow up with you.
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Redirecting to dashboard in 3 seconds...
              </p>
            </>
          ) : response.isAlreadyResponded ? (
            <>
              <div className="text-6xl mb-4">ℹ️</div>
              <h2 className="text-2xl font-bold mb-4 text-green-700">
                Already Responded
              </h2>
              <p className="text-gray-600 mb-4">{response.message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 text-sm">
                  You can only respond to each deadline alert once. If you need
                  to change your response or require assistance, please contact
                  your manager directly.
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to dashboard in 5 seconds...
              </p>
              <button
                onClick={() => {
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                  }
                  navigate("/dashboard", { replace: true });
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to Dashboard Now
              </button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
              <p className="text-gray-600 mb-4">{response.message}</p>
              <button
                onClick={() => {
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                  }
                  navigate("/dashboard", { replace: true });
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full border-t-4 border-green-600">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-900 mb-2">
            Deadline Confirmation Required
          </h1>
          <p className="text-gray-600">
            Please confirm your ability to complete this subtask on time
          </p>
        </div>

        {/* Subtask Information */}
        {subtask && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-800 mb-2">
              Subtask Details:
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-600">{subtask.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Project:</span>
                <span className="ml-2 text-gray-600">{subtask.task?.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    subtask.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : subtask.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {subtask.status}
                </span>
              </div>
              {subtask.deadline && (
                <div>
                  <span className="font-medium text-gray-700">Deadline:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(subtask.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            Will you be able to complete this subtask by the deadline?
          </h2>
          <p className="text-gray-600 text-sm">
            Your response helps the project manager plan accordingly and ensure
            project success.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleResponse(true)}
            disabled={submitting}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                Yes, I Can Complete
              </>
            )}
          </button>

          <button
            onClick={() => handleResponse(false)}
            disabled={submitting}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>Extension Needed
              </>
            )}
          </button>
        </div>

        {/* Additional Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="text-green-600 hover:text-green-700 text-sm underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeadlineConfirmation;
