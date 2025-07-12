import { useState, useEffect } from "react";
import RoleList from "../components/roles/RoleList";
import RoleAddModal from "../components/roles/RoleAddModal";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch roles on mount
  useEffect(() => {
    fetch("/api/roles", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setRoles(data));
  }, []);

  const handleAddRole = (newRole) => {
    setRoles((prev) => [...prev, newRole]);
    setShowAddModal(false);
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
        <RoleList roles={roles} />
        {showAddModal && (
          <RoleAddModal
            onClose={() => setShowAddModal(false)}
            onRoleAdded={handleAddRole}
          />
        )}
      </div>
    </div>
  );
}
