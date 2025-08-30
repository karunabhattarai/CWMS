import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import SubtaskAssignmentRow from "./SubtaskAssignmentRow";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProjectDetailsForm({
  template,
  roles,
  getMembersByRole,
  getSubtaskTemplateById,
  navigate,
}) {
  const initialAssigned = useMemo(() => {
    if (!template?.subtasks) {
      return [];
    }

    return template.subtasks
      .map((sub, index) => {
        let tpl;
        if (typeof sub === "string") {
          tpl = getSubtaskTemplateById(sub);
        } else if (sub.subtaskTemplate) {
          if (typeof sub.subtaskTemplate === "string") {
            tpl = getSubtaskTemplateById(sub.subtaskTemplate);
          } else if (typeof sub.subtaskTemplate === "object") {
            tpl = sub.subtaskTemplate;
          }
        } else {
          tpl = sub;
        }

        if (!tpl) {
          console.error("Subtask template not found:", sub);
          return null;
        }

        const roleId = typeof tpl.role === "object" ? tpl.role._id : tpl.role;
        const candidates = getMembersByRole(roleId);

        return {
          subtaskTemplate: tpl._id,
          name: tpl.name || `Subtask ${index + 1}`,
          role: roleId,
          assignedMember: candidates[0]?._id || "",
          estimatedDurationDays: tpl.estimatedDurationDays || 1,
          description: tpl.description || "",
          dependencies: [],
        };
      })
      .filter(Boolean);
  }, [template, getMembersByRole, getSubtaskTemplateById]);

  // State declarations
  const [assigned, setAssigned] = useState(initialAssigned);
  const [projectName, setProjectName] = useState("");
  const [priority, setPriority] = useState("moderate");
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [saving, setSaving] = useState(false);

  // Computed values
  const totalDays = useMemo(
    () =>
      (assigned || []).reduce(
        (sum, s) => sum + (s.estimatedDurationDays || 0),
        0
      ),
    [assigned]
  );

  const [deadline, setDeadline] = useState(() =>
    new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
  );

  // Check for missing roles before allowing task creation (based on current assigned)
  const missingRoles = useMemo(() => {
    const missing = [];
    (assigned || []).forEach((sub, index) => {
      const availableMembers = getMembersByRole(sub.role);

      if (!sub.role || availableMembers.length === 0) {
        const roleName =
          roles.find((r) => r._id === sub.role)?.name || "Unknown Role";
        missing.push({ index: index + 1, roleName, subtaskName: sub.name });
      }
    });
    return missing;
  }, [assigned, getMembersByRole, roles]);

  // Constants
  const token = localStorage.getItem("token");
  const today = new Date().toISOString().slice(0, 10);
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
  const maxDate = twoYearsFromNow.toISOString().slice(0, 10);

  // Sync assigned state with initialAssigned when it changes
  useEffect(() => {
    setAssigned(initialAssigned);
  }, [initialAssigned]);

  function handleMemberChange(idx, memberId) {
    setAssigned((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, assignedMember: memberId } : s))
    );
  }

  function handleNameChange(idx, value) {
    setAssigned((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, name: value } : s))
    );
  }

  function handleRoleChange(idx, roleId) {
    setAssigned((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, role: roleId, assignedMember: "" } : s
      )
    );
  }

  function handleRemove(idx) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this subtask?"
    );
    if (!confirmed) return;
    setAssigned((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAddCustom() {
    const newSub = {
      subtaskTemplate: null,
      name: "New Subtask",
      role: roles[0]?._id || "",
      assignedMember: "",
      estimatedDurationDays: 1,
      description: "",
      dependencies: [],
    };
    setAssigned((prev) => [...(prev || []), newSub]);
  }

  function handleDurationChange(idx, newVal) {
    setAssigned((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, estimatedDurationDays: newVal } : s
      )
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Clear previous errors/warnings
    setErrors([]);
    setWarnings([]);

    // Client-side validation
    const clientErrors = [];

    if (!projectName.trim()) {
      clientErrors.push("Project name is required.");
    }

    if (!startDate || !deadline) {
      clientErrors.push("Start date and deadline are required.");
    }

    if (new Date(deadline) < new Date(startDate)) {
      clientErrors.push("Deadline cannot be earlier than start date.");
    }

    // Check for missing roles
    if (missingRoles.length > 0) {
      const roleNames = missingRoles.map((mr) => mr.roleName).join(", ");
      clientErrors.push(
        `Missing members for roles: ${roleNames}. Please create members with these roles first.`
      );
    }

    // Check for unassigned subtasks
    const unassignedSubtasks = assigned.filter((sub) => !sub.assignedMember);
    if (unassignedSubtasks.length > 0) {
      clientErrors.push(
        `${unassignedSubtasks.length} subtask(s) have no assigned members.`
      );
    }

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/task`,
        {
          taskTemplate: template?._id || null,
          name: projectName.trim(),
          deadline,
          startDate,
          subtasks: (assigned || []).map((s) => ({
            name: s.name,
            role: s.role,
            subtaskTemplate: s.subtaskTemplate || null,
            assignedMember: s.assignedMember || null,
            estimatedDurationDays: s.estimatedDurationDays || 1,
            description: s.description || "",
            dependencies: s.dependencies || [],
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle success with potential warnings
      if (response.data.warnings?.length > 0) {
        setWarnings(response.data.warnings);
        // Still navigate after a short delay to show warnings
        setTimeout(() => {
          navigate(`/projects/${response.data.task._id}`);
        }, 2000);
      } else {
        // Navigate immediately if no warnings
        navigate(`/projects/${response.data.task._id}`);
      }
    } catch (err) {
      console.error("Task creation error:", err);

      if (err.response?.data?.errors) {
        // Backend validation errors
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        // Single error message
        setErrors([err.response.data.message]);
      } else {
        // Generic error
        setErrors(["Failed to create project. Please try again."]);
      }

      if (err.response?.data?.warnings) {
        setWarnings(err.response.data.warnings);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Missing Roles Warning */}
      {missingRoles.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-semibold mb-2">
            Missing Required Roles
          </div>
          <div className="text-red-700 text-sm mb-3">
            The following subtasks cannot be assigned because no members have
            the required roles:
          </div>
          <ul className="list-disc list-inside text-red-700 text-sm mb-3">
            {missingRoles.map((missing, idx) => (
              <li key={idx}>
                Subtask {missing.index}: "{missing.subtaskName}" requires role "
                {missing.roleName}"
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            onClick={() => navigate("/members")}
          >
            Go to Members Page
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-green-900 font-medium mb-1">
              Project Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded border border-green-200"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-green-900 font-medium mb-1">
              Priority
            </label>
            <select
              className="w-full px-3 py-2 rounded border border-green-200"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-green-900 font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded border border-green-200"
              value={startDate}
              min={today}
              max={deadline}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-green-900 font-medium mb-1">
              Deadline
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded border border-green-200"
              value={deadline}
              min={startDate}
              max={maxDate}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-green-900 font-medium mb-2">
            Subtasks & Assignment
          </label>
          <div className="space-y-4">
            {assigned.map((sub, idx) => (
              <SubtaskAssignmentRow
                key={idx}
                sub={sub}
                idx={idx}
                roles={roles}
                getMembersByRole={getMembersByRole}
                onMemberChange={handleMemberChange}
                onDurationChange={handleDurationChange}
                onNameChange={handleNameChange}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm"
              onClick={handleAddCustom}
            >
              + Add Custom Subtask
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 font-semibold mb-2">
              Validation Errors:
            </div>
            <ul className="list-disc list-inside text-red-700 text-sm">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warning Messages */}
        {warnings.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-800 font-semibold mb-2">Warnings:</div>
            <ul className="list-disc list-inside text-yellow-700 text-sm">
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className="w-1/2 px-4 py-2 rounded bg-gray-100 text-green-900 font-semibold hover:bg-gray-200 transition"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`w-1/2 px-4 py-2 rounded font-semibold transition ${
              saving || missingRoles.length > 0
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-700 text-white hover:bg-green-800"
            }`}
            disabled={saving || missingRoles.length > 0}
          >
            {saving ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
