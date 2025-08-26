import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function RegisterCompanyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setInfo(location.state.message);
      const timer = setTimeout(() => setInfo(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  //Prevent access if user already has a company - redirect to onboarding instead of dashboard
  if (user?.company) {
    return <Navigate to="/onboarding" replace />;
  }

  const fetchAndSetUserProfile = async (token) => {
    try {
      // Use user.id or user._id as appropriate
      const res = await axios.get(
        `${API_BASE}/api/user/${user?.id || user?._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update the user profile in auth context with the new company data
      updateUserProfile({
        ...res.data,
        company: res.data.company,
        companyName: res.data.company?.name,
      });
      console.log("Updated user profile:", res.data); // Debug log
      return res.data;
    } catch (error) {
      console.error("Profile update failed:", error);
      setError("Failed to update profile. Please refresh the page.");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Company name required.");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${API_BASE}/api/company/create`,
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // If a new token is provided, update it
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        // Force the auth context to reload with the new token
        window.location.reload();
        return;
      }

      setSuccess("Company registered successfully!");

      // Wait a moment then fetch updated profile
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedUser = await fetchAndSetUserProfile(token);

      if (updatedUser && updatedUser.company) {
        setTimeout(() => {
          navigate("/onboarding");
        }, 1000);
      } else {
        setError(
          "Company registered but profile update failed. Please refresh the page."
        );
      }
    } catch (err) {
      if (err.response?.data?.message === "Company already exists") {
        setSuccess("Company already exists. Redirecting to onboarding...");
        try {
          await fetchAndSetUserProfile(token);
          setTimeout(() => {
            navigate("/onboarding");
          }, 1000);
        } catch {
          setError("Please refresh the page and try again.");
        }
      } else {
        setError(
          err.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
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
        {info && (
          <div className="mb-4 px-4 py-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
            {info}
          </div>
        )}
        {/* Company Name (with label) */}
        <label
          htmlFor="company-name"
          className="block mb-1 text-cyan-900 font-medium"
        >
          Your Company
        </label>
        <input
          id="company-name"
          type="text"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Company Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        {/* Company Description (with label) */}
        <label
          htmlFor="company-description"
          className="block mb-1 text-cyan-900 font-medium"
        >
          Describe your company
        </label>
        <textarea
          id="company-description"
          className="w-full mb-4 p-2 border rounded h-24 resize-none"
          placeholder="Company Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-700 mb-2">{success}</div>}
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
