import { useState } from "react";

export default function RoleAddModal({ onClose, onRoleAdded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to add role");
      const newRole = await res.json();
      onRoleAdded(newRole);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <form
        className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-4">Add New Role</h2>
        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Role Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full mb-4 p-2 border rounded"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-700 text-white rounded"
          >
            Add Role
          </button>
        </div>
      </form>
    </div>
  );
}
