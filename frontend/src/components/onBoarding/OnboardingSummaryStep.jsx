import axios from "axios";
import { useState } from "react";

export default function OnboardingSummaryStep({
  roles,
  project,
  onBack,
  onSubmit,
}) {
  const [loading, setLoading] = useState(false);

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      // 1. Create subtask templates for each subpart
      const subtaskTemplateIds = [];
      for (const sub of project.subparts) {
        const subtaskRes = await axios.post(
          `${API_BASE}/api/subtask-template`,
          {
            role: sub.role, // This should be the backend role _id
            name: sub.name,
            description: "",
            estimatedDurationDays: sub.days,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        subtaskTemplateIds.push(subtaskRes.data._id);
      }

      // 2. Create a task template with the subtask template IDs
      await axios.post(
        `${API_BASE}/api/task-template`,
        {
          name: project.name,
          description: "",
          subtasks: subtaskTemplateIds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // Local cleanup and redirect
      localStorage.removeItem("cwmis_onboarding_draft");
      window.location.href = "/dashboard";
    } catch (err) {
      alert(
        "Submission failed: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold font-serif text-cyan-900 mb-4">
        Review & Submit
      </h2>
      {/* ...existing summary UI... */}
      <div className="flex justify-between mt-10">
        <button
          className="bg-cyan-100 text-cyan-900 px-6 py-2 rounded-xl font-medium font-sans hover:bg-cyan-200 transition"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </button>
        <button
          className="bg-orange-800 text-white px-8 py-2 rounded-xl font-semibold font-sans hover:bg-green-600 transition"
          onClick={handleFinalSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Finish & Go to Dashboard"}
        </button>
      </div>
    </div>
  );
}
