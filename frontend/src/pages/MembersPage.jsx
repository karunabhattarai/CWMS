import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import MemberList from "../components/members/MemberList";
import MemberAddModal from "../components/members/MemberAddModal";
import MemberEditModal from "../components/members/MemberEditModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState(null);

  // Get user role from JWT
  const token = localStorage.getItem("token");
  let userRole = "";
  if (token) {
    try {
      userRole = jwtDecode(token).role;
    } catch (e) {
      console.log(e);
    }
  }

  const fetchData = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [membersRes, rolesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/member`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/role`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setMembers(membersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      setFetchError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch members/roles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleAddMember = (newMember) => {
    if (newMember) {
      setMembers((prev) => [...prev, newMember]);
    } else {
      // If newMember is null, refresh the entire list
      fetchData();
    }
    setShowAddModal(false);
  };

  const handleEditMember = (updatedMember) => {
    setMembers((prev) =>
      prev.map((m) => (m._id === updatedMember._id ? updatedMember : m))
    );
    setEditMember(null);
  };

  const handleDeleteMember = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/member/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || "Failed to delete member"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#efeee8] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold font-serif text-green-900">
            All Members
          </h1>
          <button
            className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition"
            onClick={() => setShowAddModal(true)}
          >
            + Add Member
          </button>
        </div>
        {loading ? (
          <div>Loading members and roles...</div>
        ) : fetchError ? (
          <div className="text-red-600">{fetchError}</div>
        ) : (
          <MemberList
            members={members}
            roles={roles}
            userRole={userRole}
            onEdit={setEditMember}
            onDelete={handleDeleteMember}
          />
        )}
        {showAddModal && (
          <MemberAddModal
            onClose={() => setShowAddModal(false)}
            onMemberAdded={handleAddMember}
            roles={roles}
          />
        )}
        {editMember && (
          <MemberEditModal
            member={editMember}
            roles={roles}
            onClose={() => setEditMember(null)}
            onMemberEdited={handleEditMember}
          />
        )}
      </div>
    </div>
  );
}
