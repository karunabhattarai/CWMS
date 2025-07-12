import { useState } from "react";

export default function MemberAddModal({ onClose, onMemberAdded, roles }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, roles: selectedRoles }),
      });
      if (!res.ok) throw new Error("Failed to add member");
      const newMember = await res.json();
      onMemberAdded(newMember);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <form
        className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-4">Add New Member</h2>
        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="mb-4">
          <label className="block mb-2">Roles</label>
          <select
            className="w-full p-2 border rounded"
            multiple
            value={selectedRoles}
            onChange={(e) =>
              setSelectedRoles(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
          >
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
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
            Add Member
          </button>
        </div>
      </form>
    </div>
  );
}
