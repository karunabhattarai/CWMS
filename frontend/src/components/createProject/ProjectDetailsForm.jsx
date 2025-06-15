import { useState, useMemo } from "react";
import SubtaskAssignmentRow from "./SubtaskAssignmentRow";

export default function ProjectDetailsForm({
  template,
  roles,
  members,
  getMembersByRole,
  getSubtaskTemplateById,
  navigate,
}) {
  const initialAssigned = useMemo(() => {
    return template.subtasks.map((sub) => {
      const tpl = typeof sub === "string" ? getSubtaskTemplateById(sub) : sub;
      const candidates = getMembersByRole(tpl.role);
      return {
        subtaskTemplate: tpl._id,
        name: tpl.name,
        role: tpl.role,
        assignedMember: candidates[0]?._id || "",
        estimatedDurationDays: tpl.estimatedDurationDays,
      };
    });
  }, [template, getMembersByRole, getSubtaskTemplateById]);

  const [projectName, setProjectName] = useState("");
  const [priority, setPriority] = useState("moderate");
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const totalDays = useMemo(
    () =>
      initialAssigned.reduce(
        (sum, s) => sum + (s.estimatedDurationDays || 0),
        0
      ),
    [initialAssigned]
  );
  const [deadline, setDeadline] = useState(() =>
    new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
  );
  const [assigned, setAssigned] = useState(initialAssigned);
  const [error, setError] = useState("");

  function handleMemberChange(idx, memberId) {
    setAssigned((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, assignedMember: memberId } : s))
    );
  }
  function handleDurationChange(idx, newVal) {
    setAssigned((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, estimatedDurationDays: newVal } : s
      )
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!projectName.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!startDate || !deadline) {
      setError("Start date and deadline are required.");
      return;
    }
    if (new Date(deadline) < new Date(startDate)) {
      setError("Deadline cannot be before start date.");
      return;
    }
    setError("");
    alert(
      `Project "${projectName}" created with priority "${priority}", start: ${startDate}, deadline: ${deadline}`
    );
    navigate("/projects");
  }

  return (
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
              members={members}
              getMembersByRole={getMembersByRole}
              onMemberChange={handleMemberChange}
              onDurationChange={handleDurationChange}
            />
          ))}
        </div>
      </div>
      {error && <div className="text-rose-700 text-sm">{error}</div>}
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
          className="w-1/2 px-4 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800 transition"
        >
          Create Project
        </button>
      </div>
    </form>
  );
}
