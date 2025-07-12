import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function MemberAddModal({ onClose, onMemberAdded, roles }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const res = await axios.post(
        `${API_BASE}/api/member`,
        { name, email, roles: selectedRoles },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onMemberAdded(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to add member"
      );
    } finally {
      setLoading(false);
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
            disabled={loading}
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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-700 text-white rounded"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </form>
    </div>
  );
}
