import { useState, useEffect } from "react";

const DEMO_ROLES = [
  {
    name: "",
    employees: [{ name: "", email: "" }],
  },
];

export default function OnboardingRolesStep({
  roles,
  setRoles,
  onNext,
  onBack,
}) {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roles || roles.length === 0) setRoles(DEMO_ROLES);
    // eslint-disable-next-line
  }, []);

  const handleRoleChange = (idx, value) => {
    const updated = [...roles];
    updated[idx].name = value;
    setRoles(updated);
  };

  const handleEmployeeChange = (roleIdx, empIdx, field, value) => {
    const updated = [...roles];
    updated[roleIdx].employees[empIdx][field] = value;
    setRoles(updated);
  };

  const addRole = () =>
    setRoles([...roles, { name: "", employees: [{ name: "", email: "" }] }]);
  const removeRole = (idx) => {
    if (roles.length === 1) return;
    setRoles(roles.filter((_, i) => i !== idx));
  };

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

  const handleNext = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    onNext();
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
            key={idx}
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
              />
              {roles.length > 1 && (
                <button
                  className="sm:ml-3 text-red-500 hover:bg-red-50 rounded-full p-2 transition self-start sm:self-auto"
                  onClick={() => removeRole(idx)}
                  title="Remove role"
                  type="button"
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
                    />
                    {role.employees.length > 1 && (
                      <button
                        className="sm:ml-1 text-red-400 hover:bg-red-50 rounded-full p-2 transition self-start sm:self-auto"
                        onClick={() => removeEmployee(idx, empIdx)}
                        title="Remove member"
                        type="button"
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
      >
        + Add Role
      </button>
      {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
      <div className="flex flex-col sm:flex-row justify-between mt-10 gap-2">
        <button
          className="bg-cyan-100 text-cyan-900 px-6 py-2 rounded-xl font-medium font-sans hover:bg-cyan-200 transition"
          onClick={onBack}
          type="button"
        >
          Back
        </button>
        <button
          className="bg-orange-800 text-white px-8 py-2 rounded-xl font-semibold font-sans hover:bg-green-600 transition"
          onClick={handleNext}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
