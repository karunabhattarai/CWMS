import { useState } from "react";
import { Modal } from "./common";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AddManagerModal({
  isOpen,
  onClose,
  onManagerCreated,
  onSkip,
  variant = "dashboard", // "dashboard" or "onboarding"
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateManager = async () => {
    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/api/user/register`,
        {
          name: formData.name,
          email: formData.email,
          role: "manager",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // Success - show success message for 2 seconds then close
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onManagerCreated) {
          onManagerCreated(response.data);
        }
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create manager"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "" });
    setError("");
    setSuccess(false);
    onClose();
  };

  // Get variant-specific content
  const isOnboarding = variant === "onboarding";

  const content = {
    title: isOnboarding ? "Delegate Onboarding Setup" : "Add New Manager",
    message: isOnboarding
      ? "Before skipping, would you like to create a manager for your company? This will help you delegate tasks and team setup later."
      : "Create a new manager account for your organization. They will be able to oversee projects and manage team members.",
    buttonText: isOnboarding ? "Create Manager" : "Add Manager",
    skipText: "Skip Without Manager",
    cancelText: "Cancel",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      maxWidth="max-w-lg"
      showCloseButton={true}
    >
      <div className="space-y-6">
        <div className="text-center">
          <h3
            className={`text-xl font-bold font-serif ${
              isOnboarding ? "text-cyan-900" : "text-green-900"
            } mb-2`}
          >
            {content.title}
          </h3>
          <p
            className={`${
              isOnboarding ? "text-cyan-800" : "text-green-800"
            } font-sans`}
          >
            {content.message}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="manager-name"
              className={`block text-sm font-medium ${
                isOnboarding ? "text-cyan-900" : "text-green-900"
              } mb-1 font-sans`}
            >
              Manager Name
            </label>
            <input
              type="text"
              id="manager-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter manager's full name"
              className={`w-full px-4 py-2 border ${
                isOnboarding
                  ? "border-cyan-200 focus:ring-orange-800"
                  : "border-green-200 focus:ring-green-600"
              } rounded-xl focus:ring-2 focus:border-transparent font-sans`}
              disabled={loading || success}
            />
          </div>

          <div>
            <label
              htmlFor="manager-email"
              className={`block text-sm font-medium ${
                isOnboarding ? "text-cyan-900" : "text-green-900"
              } mb-1 font-sans`}
            >
              Manager Email
            </label>
            <input
              type="email"
              id="manager-email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter manager's email address"
              className={`w-full px-4 py-2 border ${
                isOnboarding
                  ? "border-cyan-200 focus:ring-orange-800"
                  : "border-green-200 focus:ring-green-600"
              } rounded-xl focus:ring-2 focus:border-transparent font-sans`}
              disabled={loading || success}
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-xl border border-green-200">
            ✅ Manager created successfully! They will receive an email with
            instructions to set their password.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {isOnboarding && onSkip ? (
            <button
              className="flex-1 text-sm underline text-green-600 font-medium font-sans hover:text-orange-800 transition px-4 py-2 disabled:opacity-50"
              onClick={onSkip}
              disabled={loading || success}
            >
              {content.skipText}
            </button>
          ) : (
            <button
              className={`flex-1 text-sm ${
                isOnboarding
                  ? "text-cyan-600 hover:text-cyan-800 border-cyan-200 hover:bg-cyan-50"
                  : "text-green-600 hover:text-green-800 border-green-200 hover:bg-green-50"
              } font-medium font-sans transition px-4 py-2 rounded-xl border disabled:opacity-50`}
              onClick={handleClose}
              disabled={loading || success}
            >
              {content.cancelText}
            </button>
          )}
          <button
            className={`flex-1 ${
              isOnboarding
                ? "bg-orange-800 hover:bg-green-600"
                : "bg-green-700 hover:bg-green-800"
            } text-white px-6 py-2 rounded-xl font-semibold font-sans transition disabled:opacity-50`}
            onClick={handleCreateManager}
            disabled={loading || success}
          >
            {success
              ? "Created!"
              : loading
              ? "Creating..."
              : content.buttonText}
          </button>
        </div>

        <div
          className={`${
            isOnboarding
              ? "bg-cyan-50 border-cyan-200"
              : "bg-green-50 border-green-200"
          } border rounded-xl p-3`}
        >
          <p
            className={`text-xs ${
              isOnboarding ? "text-cyan-800" : "text-green-800"
            } text-center font-sans`}
          >
            📧 The manager will receive an email with instructions to activate
            their account and set up their password.
          </p>
        </div>
      </div>
    </Modal>
  );
}
