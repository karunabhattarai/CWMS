import { useState, useEffect } from "react";
import axios from "axios";
import {
  API_BASE,
  getAuthHeaders,
  saveDraft,
  loadDraft,
  validateRequired,
} from "../../utils/onboardingUtils";
import {
  OnboardingContainer,
  OnboardingNavigation,
  ErrorMessage,
} from "./OnboardingUI";

export default function OnboardingRolesStep({
  roles,
  setRoles,
  onNext,
  onSkip,
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize with one empty role if none exist
  useEffect(() => {
    if (!roles || roles.length === 0) {
      setRoles([{ name: "", description: "" }]);
    }
  }, [roles, setRoles]);

  const addRole = () => setRoles([...roles, { name: "", description: "" }]);

  const removeRole = async (idx) => {
    if (roles.length === 1) return;

    const roleToRemove = roles[idx];
    if (roleToRemove._id) {
      setLoading(true);
      try {
        await axios.delete(
          `${API_BASE}/api/role/${roleToRemove._id}`,
          getAuthHeaders()
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete role");
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setRoles(roles.filter((_, i) => i !== idx));
  };

  const handleRoleChange = (idx, field, value) => {
    const updated = [...roles];
    updated[idx][field] = value;
    setRoles(updated);
  };

  const validate = () => {
    if (!roles.length) return "At least one role is required.";
    for (let role of roles) {
      const nameError = validateRequired(role.name, "Role name");
      if (nameError) return nameError;
    }
    return "";
  };

  const handleNext = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const updatedRoles = [];

      for (const role of roles) {
        const roleData = { name: role.name, description: role.description };

        if (role._id) {
          const res = await axios.put(
            `${API_BASE}/api/role/${role._id}`,
            roleData,
            getAuthHeaders()
          );
          updatedRoles.push(res.data);
        } else {
          const res = await axios.post(
            `${API_BASE}/api/role`,
            roleData,
            getAuthHeaders()
          );
          updatedRoles.push(res.data);
        }
      }

      // Save updated roles to localStorage draft
      const allData = loadDraft();
      allData.roles = updatedRoles;
      saveDraft(allData);

      setRoles(updatedRoles);
      console.log("Roles saved:", updatedRoles);
      onNext();
    } catch (error) {
      console.error("Error saving roles:", error);
      setError(error.response?.data?.message || "Failed to save roles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingContainer>
      <h2 className="text-2xl font-bold font-serif text-cyan-900 mb-2">
        Define Team Roles
      </h2>
      <p className="text-cyan-800 font-sans mb-6">
        Start by defining the roles in your team. You'll assign members to these
        roles in the next step.
      </p>

      <div className="space-y-4">
        {roles.map((role, idx) => (
          <div
            key={role._id || idx}
            className="bg-[#efeee8] rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans text-base"
                  value={role.name}
                  onChange={(e) =>
                    handleRoleChange(idx, "name", e.target.value)
                  }
                  placeholder="Role name (e.g., Designer, Developer, Manager)"
                  disabled={loading}
                />
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans text-sm"
                  value={role.description}
                  onChange={(e) =>
                    handleRoleChange(idx, "description", e.target.value)
                  }
                  placeholder="Brief description (optional)"
                  disabled={loading}
                />
              </div>
              {roles.length > 1 && (
                <button
                  className="text-red-500 hover:bg-red-50 rounded-full p-2 transition mt-1"
                  onClick={() => removeRole(idx)}
                  title="Remove role"
                  disabled={loading}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="mt-6 text-green-700 font-medium underline hover:text-green-900 disabled:opacity-50"
        onClick={addRole}
        disabled={loading}
      >
        + Add Role
      </button>

      <ErrorMessage error={error} />

      <OnboardingNavigation
        onPrevious={null}
        onNext={handleNext}
        onSkip={onSkip}
        nextLabel="Next: Add Members"
        nextDisabled={loading}
        showSkip={true}
        loading={loading}
      />
    </OnboardingContainer>
  );
}
