import { useState, useEffect } from "react";
import MemberList from "../components/members/MemberList";
import MemberAddModal from "../components/members/MemberAddModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/member`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMembers(data));
    fetch(`${API_BASE}/api/roles`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setRoles(data));
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
        <MemberList members={members} roles={roles} />
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
