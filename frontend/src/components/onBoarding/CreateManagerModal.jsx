import { useState } from "react";
import Modal from "../common/Modal";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CreateManagerModal({
  isOpen,
  onClose,
  onSkip,
  onManagerCreated,
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
      await axios.post(
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

      // Success - show success message for 2 seconds then redirect
      setSuccess(true);
      setTimeout(() => {
        onManagerCreated();
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
          <h3 className="text-xl font-bold font-serif text-cyan-900 mb-2">
            Delegate Onboarding Setup
          </h3>
          <p className="text-cyan-800 font-sans">
            Before skipping, would you like to create a manager for your company? This will help you delegate tasks and team setup later.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-cyan-900 mb-1 font-sans"
            >
              Manager Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter manager's full name"
              className="w-full px-4 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-orange-800 focus:border-transparent font-sans"
              disabled={loading || success}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-cyan-900 mb-1 font-sans"
            >
              Manager Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter manager's email address"
              className="w-full px-4 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-orange-800 focus:border-transparent font-sans"
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
            ✅ Manager created successfully! They will receive a email with
            instructions to set their password.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            className="flex-1 text-sm underline text-green-600 font-medium font-sans hover:text-orange-800 transition px-4 py-2 disabled:opacity-50"
            onClick={onSkip}
            disabled={loading || success}
          >
            Skip Without Manager
          </button>
          <button
            className="flex-1 bg-orange-800 text-white px-6 py-2 rounded-xl font-semibold font-sans hover:bg-green-600 transition disabled:opacity-50"
            onClick={handleCreateManager}
            disabled={loading || success}
          >
            {success ? "Created!" : loading ? "Creating..." : "Create Manager"}
          </button>
        </div>

        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3">
          <p className="text-xs text-cyan-800 text-center font-sans">
            📧 The manager will receive a email with instructions to activate
            their account.
          </p>
        </div>
      </div>
    </Modal>
  );
}
