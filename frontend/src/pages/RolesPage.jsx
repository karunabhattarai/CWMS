import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import RoleList from "../components/roles/RoleList";
import RoleAddModal from "../components/roles/RoleAddModal";
import RoleEditModal from "../components/roles/RoleEditModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRole, setEditRole] = useState(null);

  // Get user role from JWT
  const token = localStorage.getItem("token");
  let userRole = "";
  if (token) {
    try {
      userRole = jwtDecode(token).role;
    } catch (e) {}
  }

  const fetchRoles = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${API_BASE}/api/role`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(res.data);
    } catch (err) {
      setFetchError(
        err.response?.data?.message || err.message || "Failed to fetch roles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line
  }, []);

  const handleAddRole = (newRole) => {
    setRoles((prev) => [...prev, newRole]);
    setShowAddModal(false);
  };

  const handleEditRole = (updatedRole) => {
    setRoles((prev) =>
      prev.map((r) => (r._id === updatedRole._id ? updatedRole : r))
    );
    setEditRole(null);
  };

  const handleDeleteRole = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/role/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || "Failed to delete role"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#efeee8] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold font-serif text-green-900">
            All Roles
          </h1>
          <button
            className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition"
            onClick={() => setShowAddModal(true)}
          >
            + Add Role
          </button>
        </div>
        {loading ? (
          <div>Loading roles...</div>
        ) : fetchError ? (
          <div className="text-red-600">{fetchError}</div>
        ) : (
          <RoleList
            roles={roles}
            userRole={userRole}
            onEdit={setEditRole}
            onDelete={handleDeleteRole}
          />
        )}
        {showAddModal && (
          <RoleAddModal
            onClose={() => setShowAddModal(false)}
            onRoleAdded={handleAddRole}
          />
        )}
        {editRole && (
          <RoleEditModal
            role={editRole}
            onClose={() => setEditRole(null)}
            onRoleEdited={handleEditRole}
          />
        )}
      </div>
    </div>
  );
}
