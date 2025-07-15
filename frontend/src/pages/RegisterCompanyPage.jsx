import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function RegisterCompanyPage() {
  const location = useLocation();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");

  // Show redirect message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setInfo(location.state.message);
      const timer = setTimeout(() => setInfo(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_BASE}/api/company/create`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setSuccess("Company registered successfully!");

      // Optional: redirect to dashboard after 1.2 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to register company"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efeee8] px-2">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-green-900">
          Register Company
        </h2>

        {/* Info message from redirect */}
        {info && (
          <div className="mb-4 px-4 py-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
            {info}
          </div>
        )}

        {/* Company name input */}
        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Company Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        {/* Error and success messages */}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-700 mb-2">{success}</div>}

        {/* Submit button */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-green-700 text-white rounded"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}
