import { useState, useEffect } from "react";
import axios from "axios";
import {
  API_BASE,
  getAuthHeaders,
  saveDraft,
  loadDraft,
  validateRequired,
  validateEmail,
} from "../../utils/onboardingUtils";
import {
  OnboardingContainer,
  OnboardingNavigation,
  ErrorMessage,
} from "./OnboardingUI";

export default function OnboardingMembersStep({
  roles,
  members,
  setMembers,
  onNext,
  onBack,
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize with one empty member if none exist
  useEffect(() => {
    if (!members || members.length === 0) {
      setMembers([{ name: "", email: "", roles: [] }]);
    }
  }, [members, setMembers]);

  // Add a new blank member
  const addMember = () =>
    setMembers([...members, { name: "", email: "", roles: [] }]);

  // Remove a member (delete from backend if it has _id)
  const removeMember = async (idx) => {
    if (members.length === 1) return;

    const memberToRemove = members[idx];
    if (memberToRemove._id) {
      setLoading(true);
      try {
        await axios.delete(
          `${API_BASE}/api/member/${memberToRemove._id}`,
          getAuthHeaders()
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete member");
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setMembers(members.filter((_, i) => i !== idx));
  };

  // Handle member field changes
  const handleMemberChange = (idx, field, value) => {
    const updated = [...members];
    updated[idx][field] = value;
    setMembers(updated);
  };

  // Handle role selection (multiple roles per member)
  const handleRoleToggle = (memberIdx, roleId) => {
    const updated = [...members];
    const member = updated[memberIdx];

    if (member.roles.includes(roleId)) {
      member.roles = member.roles.filter((id) => id !== roleId);
    } else {
      member.roles = [...member.roles, roleId];
    }

    setMembers(updated);
  };

  // Validation
  const validate = () => {
    if (!members.length) return "At least one member is required.";
    for (let member of members) {
      const nameError = validateRequired(member.name, "Member name");
      if (nameError) return nameError;

      const emailError = validateRequired(member.email, "Member email");
      if (emailError) return emailError;

      const emailFormatError = validateEmail(member.email);
      if (emailFormatError) return emailFormatError;

      if (!member.roles.length) {
        return "All members must have at least one role assigned.";
      }
    }
    return "";
  };

  // Save members to backend and proceed
  const handleNext = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const updatedMembers = [];

      for (const member of members) {
        const memberData = {
          name: member.name,
          email: member.email,
          roles: member.roles,
        };

        if (member._id) {
          const res = await axios.put(
            `${API_BASE}/api/member/${member._id}`,
            memberData,
            getAuthHeaders()
          );
          updatedMembers.push(res.data);
        } else {
          // For new members, try to register as user first, then handle member creation
          try {
            // Try to register user first (this will send verification email)
            await axios.post(
              `${API_BASE}/api/user/register`,
              {
                name: member.name,
                email: member.email,
                role: "employee",
                memberRoles: member.roles,
              },
              getAuthHeaders()
            );

            // If user registration succeeds, they're a new user
            // The member was created automatically by registerUser
            // Now get the created member
            const memberRes = await axios.get(
              `${API_BASE}/api/member`,
              getAuthHeaders()
            );

            // Find the member that matches this email
            const createdMember = memberRes.data.find(
              (m) => m.email === member.email
            );
            if (createdMember) {
              updatedMembers.push(createdMember);
            }
          } catch (userError) {
            if (
              userError.response?.status === 400 &&
              userError.response?.data?.message === "User already exists"
            ) {
              // User exists, just create/update member record
              const res = await axios.post(
                `${API_BASE}/api/member`,
                memberData,
                getAuthHeaders()
              );
              updatedMembers.push(res.data);
            } else {
              throw userError;
            }
          }
        }
      }

      // Save updated members to localStorage draft
      const allData = loadDraft();
      allData.members = updatedMembers;
      saveDraft(allData);

      setMembers(updatedMembers);
      console.log("Members saved:", updatedMembers);
      onNext();
    } catch (error) {
      console.error("Error saving members:", error);
      setError(error.response?.data?.message || "Failed to save members");
    } finally {
      setLoading(false);
    }
  };

  // Get role name by ID
  const getRoleName = (roleId) => {
    const role = roles.find((r) => r._id === roleId);
    return role ? role.name : roleId;
  };

  return (
    <OnboardingContainer>
      <h2 className="text-2xl font-bold font-serif text-cyan-900 mb-2">
        Add Team Members
      </h2>
      <p className="text-cyan-800 font-sans mb-6">
        Now, let's add your team members and assign them to the roles you
        defined.
      </p>

      <div className="space-y-6">
        {members.map((member, idx) => (
          <div
            key={member._id || idx}
            className="bg-[#efeee8] rounded-xl p-5 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-cyan-900 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans"
                  value={member.name}
                  onChange={(e) =>
                    handleMemberChange(idx, "name", e.target.value)
                  }
                  placeholder="Full name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans"
                  value={member.email}
                  onChange={(e) =>
                    handleMemberChange(idx, "email", e.target.value)
                  }
                  placeholder="Email address"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-900 mb-2">
                Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <button
                    key={role._id}
                    type="button"
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      member.roles.includes(role._id)
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => handleRoleToggle(idx, role._id)}
                    disabled={loading}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
              {member.roles.length > 0 && (
                <p className="text-xs text-cyan-800 mt-1">
                  Selected: {member.roles.map(getRoleName).join(", ")}
                </p>
              )}
            </div>

            {members.length > 1 && (
              <div className="flex justify-end mt-3">
                <button
                  className="text-red-500 hover:bg-red-50 rounded-full p-2 transition"
                  onClick={() => removeMember(idx)}
                  title="Remove member"
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className="mt-6 text-green-700 font-medium underline hover:text-green-900"
        onClick={addMember}
        disabled={loading}
      >
        + Add Member
      </button>

      <ErrorMessage error={error} />

      <OnboardingNavigation
        onPrevious={onBack}
        onNext={handleNext}
        onSkip={null}
        nextLabel="Next: Project"
        previousLabel="← Back to Roles"
        nextDisabled={loading}
        showSkip={false}
        loading={loading}
      />
    </OnboardingContainer>
  );
}
