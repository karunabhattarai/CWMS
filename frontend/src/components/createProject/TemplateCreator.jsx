import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function TemplateCreator({ roles, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([
    { name: "", estimatedDurationDays: 1, role: roles[0]?._id || "" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSubtaskChange(idx, field, value) {
    setSubtasks((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }
  function handleAddSubtask() {
    setSubtasks((prev) => [
      ...prev,
      { name: "", estimatedDurationDays: 1, role: roles[0]?._id || "" },
    ]);
  }
  function handleRemoveSubtask(idx) {
    setSubtasks((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }
    if (subtasks.length === 0) {
      setError("At least one subtask is required.");
      return;
    }
    for (const sub of subtasks) {
      if (!sub.name.trim() || !sub.estimatedDurationDays || !sub.role) {
        setError("All subtasks must have name, duration, and role.");
        return;
      }
    }
    setError("");
    setSaving(true);
    try {
      // Create all subtasks as subtask templates first
      const subpartIds = [];
      const token = localStorage.getItem("token");
      for (const sub of subtasks) {
        const subRes = await axios.post(
          `${API_BASE}/api/subtask-template`,
          {
            name: sub.name,
            role: sub.role,
            estimatedDurationDays: sub.estimatedDurationDays,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        subpartIds.push({
          subtaskTemplate: subRes.data._id,
        });
      }
      // Now create the template linking those subtasks
      const tplRes = await axios.post(
        `${API_BASE}/api/task-template`,
        {
          name,
          description,
          subtasks: subpartIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onSave(tplRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow p-6 space-y-6 border border-green-100 overflow-hidden"
    >
      <h2 className="text-2xl font-serif font-bold text-green-900 text-center">
        Create New Project Template
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-green-900 font-medium mb-1">
            Template Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-green-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-green-900 font-medium mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 rounded border border-green-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-green-900 mb-2">Subtasks</h3>
        <div className="space-y-3">
          {subtasks.map((sub, idx) => (
            <div
              key={idx}
              className="bg-green-50 border border-green-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_auto] gap-2 items-center"
            >
              <input
                type="text"
                className="w-full px-3 py-2 rounded border border-green-200"
                placeholder="Subtask name"
                value={sub.name}
                onChange={(e) =>
                  handleSubtaskChange(idx, "name", e.target.value)
                }
                required
              />
              <select
                className="w-full px-3 py-2 rounded border border-green-200"
                value={sub.role}
                onChange={(e) =>
                  handleSubtaskChange(idx, "role", e.target.value)
                }
                required
              >
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <select
                className="w-full px-3 py-2 rounded border border-green-200"
                value={sub.estimatedDurationDays}
                onChange={(e) =>
                  handleSubtaskChange(
                    idx,
                    "estimatedDurationDays",
                    Number(e.target.value)
                  )
                }
                required
              >
                {[...Array(14).keys()].map((i) => {
                  const day = i + 1;
                  return (
                    <option key={day} value={day}>
                      {day} day{day > 1 ? "s" : ""}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                className="text-rose-600 text-xl hover:text-rose-800"
                onClick={() => handleRemoveSubtask(idx)}
                disabled={subtasks.length === 1}
                title="Remove subtask"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 text-green-700 font-medium underline hover:text-green-900"
          onClick={handleAddSubtask}
        >
          + Add Another Subtask
        </button>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-100 text-green-900 font-semibold hover:bg-gray-200 transition"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800 transition"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>
    </form>
  );
}
