import { useState, useEffect } from "react";
import axios from "axios";
import MemberList from "../components/members/MemberList";
import MemberAddModal from "../components/members/MemberAddModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const token = localStorage.getItem("token");
        const [membersRes, rolesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/member`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_BASE}/api/role`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
    fetchData();
  }, []);

  const handleAddMember = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
    setShowAddModal(false);
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
          <MemberList members={members} roles={roles} />
        )}
        {showAddModal && (
          <MemberAddModal
            onClose={() => setShowAddModal(false)}
            onMemberAdded={handleAddMember}
            roles={roles}
          />
        )}
      </div>
    </div>
  );
}
