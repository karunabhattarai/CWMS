import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function MemberEditModal({
  member,
  roles,
  onClose,
  onMemberEdited,
}) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [selectedRoles, setSelectedRoles] = useState(
    member.roles?.map((role) => (typeof role === "string" ? role : role._id)) ||
      []
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addRole = (roleId) => {
    if (!selectedRoles.includes(roleId)) {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const removeRole = (roleId) => {
    setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/api/member/${member._id}`,
        { name, email, roles: selectedRoles },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onMemberEdited(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to edit member"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <form
        className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-4">Edit Member</h2>

        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <div className="mb-4">
          <label className="block mb-2 font-medium">Roles</label>

          {/* Selected role pills */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedRoles.map((roleId) => {
              const role = roles.find((r) => r._id === roleId);
              if (!role) return null;
              return (
                <span
                  key={roleId}
                  className="flex items-center bg-blue-100 text-blue-900 rounded-full px-3 py-1 text-sm"
                >
                  {role.name}
                  <button
                    type="button"
                    className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-blue-300 hover:bg-blue-500 text-blue-900 hover:text-white"
                    onClick={() => removeRole(roleId)}
                  >
                    &times;
                  </button>
                </span>
              );
            })}
          </div>

          {/* Selectable role buttons */}
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role._id}
                type="button"
                className={`px-3 py-1 rounded-full border ${
                  selectedRoles.includes(role._id)
                    ? "bg-green-600 text-white border-green-700"
                    : "bg-gray-100 text-greegreenn-800 border--300 hover:bg-blue-200"
                }`}
                onClick={() => addRole(role._id)}
                disabled={selectedRoles.includes(role._id) || loading}
              >
                {role.name}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 text-white rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
