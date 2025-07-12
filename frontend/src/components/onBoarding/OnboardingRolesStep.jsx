import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function OnboardingRolesStep({
  roles,
  setRoles,
  onNext,
  onSkip,
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount, initialize roles if needed
  useEffect(() => {
    if (!roles || roles.length === 0)
      setRoles([{ name: "", employees: [{ name: "", email: "" }] }]);
    // eslint-disable-next-line
  }, []);

  // Remove a role (delete from backend if it has _id)
  const removeRole = async (idx) => {
    if (roles.length === 1) return;
    const roleToRemove = roles[idx];
    if (roleToRemove._id) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/api/role/${roleToRemove._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to delete role"
        );
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setRoles(roles.filter((_, i) => i !== idx));
  };

  // Add a new blank role (frontend only)
  const addRole = () =>
    setRoles([...roles, { name: "", employees: [{ name: "", email: "" }] }]);

  // Handle role name change (frontend only)
  const handleRoleChange = (idx, value) => {
    const updated = [...roles];
    updated[idx].name = value;
    setRoles(updated);
  };

  // Handle employee field changes (frontend only)
  const handleEmployeeChange = (roleIdx, empIdx, field, value) => {
    const updated = [...roles];
    updated[roleIdx].employees[empIdx][field] = value;
    setRoles(updated);
  };

  // Add/remove employees (frontend only)
  const addEmployee = (roleIdx) => {
    const updated = [...roles];
    updated[roleIdx].employees.push({ name: "", email: "" });
    setRoles(updated);
  };
  const removeEmployee = (roleIdx, empIdx) => {
    if (roles[roleIdx].employees.length === 1) return;
    const updated = [...roles];
    updated[roleIdx].employees = updated[roleIdx].employees.filter(
      (_, i) => i !== empIdx
    );
    setRoles(updated);
  };

  // Validation before moving to next step
  const validate = () => {
    if (!roles.length) return "At least one role is required.";
    for (let r of roles) {
      if (!r.name.trim()) return "Each role must have a name.";
      if (!r.employees.length)
        return "Each role must have at least one member.";
      for (let e of r.employees) {
        if (!e.name.trim() || !e.email.trim())
          return "All member fields are required.";
        if (!/\S+@\S+\.\S+/.test(e.email)) return "Invalid email format.";
      }
    }
    return "";
  };

  // POST all roles (and members) on Next
  const handleNext = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const newRoles = [];
      // 1. Create/Update roles
      for (const role of roles) {
        let roleId = role._id;
        if (!roleId) {
          // Create new role
          const res = await axios.post(
            `${API_BASE}/api/role`,
            { name: role.name, description: "" },
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );
          roleId = res.data._id;
        }
        newRoles.push({ ...role, _id: roleId });
      }

      // 2. Create members for each role (optional: skip if already created)
      for (const role of newRoles) {
        for (const emp of role.employees) {
          if (!emp._id) {
            await axios.post(
              `${API_BASE}/api/member`,
              { name: emp.name, email: emp.email, roles: [role._id] },
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              }
            );
          }
        }
      }

      setRoles(newRoles);
      setLoading(false);
      onNext();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save roles/members"
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl font-bold font-serif text-cyan-900 mb-2">
        Team Roles & Members
      </h2>
      <p className="text-cyan-800 font-sans mb-6">
        Add your team roles and assign at least one member to each.
      </p>
      <div className="space-y-8">
        {roles.map((role, idx) => (
          <div
            key={role._id || idx}
            className="bg-[#efeee8] rounded-xl p-4 sm:p-5 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center mb-3 gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans text-base sm:text-lg mb-2 sm:mb-0"
                value={role.name}
                onChange={(e) => handleRoleChange(idx, e.target.value)}
                placeholder="Role name (e.g. Designer)"
                autoComplete="off"
                disabled={loading}
              />
              {roles.length > 1 && (
                <button
                  className="sm:ml-3 text-red-500 hover:bg-red-50 rounded-full p-2 transition self-start sm:self-auto"
                  onClick={() => removeRole(idx)}
                  title="Remove role"
                  type="button"
                  disabled={loading}
                >
                  &times;
                </button>
              )}
            </div>
            <div>
              <div className="font-semibold text-cyan-900 mb-2 text-sm">
                Members
              </div>
              <div className="space-y-2">
                {role.employees.map((emp, empIdx) => (
                  <div
                    key={empIdx}
                    className="flex flex-col sm:flex-row sm:items-center gap-2"
                  >
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 rounded-xl border border-cyan-200 font-sans"
                      value={emp.name}
                      onChange={(e) =>
                        handleEmployeeChange(
                          idx,
                          empIdx,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Full name"
                      autoComplete="off"
                      disabled={loading}
                    />
                    <input
                      type="email"
                      className="flex-1 px-3 py-2 rounded-xl border border-cyan-200 font-sans"
                      value={emp.email}
                      onChange={(e) =>
                        handleEmployeeChange(
                          idx,
                          empIdx,
                          "email",
                          e.target.value
                        )
                      }
                      placeholder="Email"
                      autoComplete="off"
                      disabled={loading}
                    />
                    {role.employees.length > 1 && (
                      <button
                        className="sm:ml-1 text-red-400 hover:bg-red-50 rounded-full p-2 transition self-start sm:self-auto"
                        onClick={() => removeEmployee(idx, empIdx)}
                        title="Remove member"
                        type="button"
                        disabled={loading}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="mt-3 text-green-700 font-medium underline hover:text-green-900"
                onClick={() => addEmployee(idx)}
                type="button"
                disabled={loading}
              >
                + Add Member
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-8 text-green-700 font-medium underline hover:text-green-900"
        onClick={addRole}
        type="button"
        disabled={loading}
      >
        + Add Role
      </button>
      {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
      <div className="flex flex-col sm:flex-row justify-between mt-10 gap-2">
        <button
          className="text-sm underline text-green-600 font-medium font-sans hover:text-orange-800 transition"
          onClick={onSkip}
          disabled={loading}
        >
          Skip Onboarding
        </button>
        <button
          className="bg-orange-800 text-white px-8 py-2 rounded-xl font-semibold font-sans hover:bg-green-600 transition"
          onClick={handleNext}
          type="button"
          disabled={loading}
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
}
