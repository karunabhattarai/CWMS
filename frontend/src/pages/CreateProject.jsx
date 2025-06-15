import { useState, useMemo } from "react";
import {
  taskTemplates,
  subtaskTemplates,
  roles,
  members,
} from "../dummyData.jsx";
import { useNavigate } from "react-router-dom";

function getTemplateById(id) {
  return taskTemplates.find((tpl) => tpl._id === id);
}
function getSubtaskTemplateById(id) {
  return subtaskTemplates.find((tpl) => tpl._id === id);
}
function getMembersByRole(roleId) {
  return members.filter((m) => m.roles.includes(roleId));
}

export default function CreateProjectPage() {
  // Step 1: Template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const template = useMemo(
    () => getTemplateById(selectedTemplateId),
    [selectedTemplateId]
  );
  const navigate = useNavigate();

  // Step 2: Project details (only after template selected)
  const initialAssigned = useMemo(() => {
    if (!template) return [];
    return template.subtasks.map((subId) => {
      const tpl = getSubtaskTemplateById(subId);
      const candidates = getMembersByRole(tpl.role);
      return {
        subtaskTemplate: tpl._id,
        name: tpl.name,
        role: tpl.role,
        assignedMember: candidates[0]?._id || "",
        estimatedDurationDays: tpl.estimatedDurationDays,
      };
    });
  }, [template]);

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

  // Reset dependent state when template changes
  function handleTemplateChange(id) {
    setSelectedTemplateId(id);
    setProjectName("");
    setPriority("moderate");
    setStartDate(new Date().toISOString().slice(0, 10));
    const tpl = getTemplateById(id);
    if (tpl) {
      const assignedArr = tpl.subtasks.map((subId) => {
        const stpl = getSubtaskTemplateById(subId);
        const candidates = getMembersByRole(stpl.role);
        return {
          subtaskTemplate: stpl._id,
          name: stpl.name,
          role: stpl.role,
          assignedMember: candidates[0]?._id || "",
          estimatedDurationDays: stpl.estimatedDurationDays,
        };
      });
      setAssigned(assignedArr);
      const totalDays = assignedArr.reduce(
        (sum, s) => sum + (s.estimatedDurationDays || 0),
        0
      );
      setDeadline(
        new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      );
    } else {
      setAssigned([]);
      setDeadline(new Date().toISOString().slice(0, 10));
    }
    setError("");
  }

  function handleMemberChange(idx, memberId) {
    setAssigned((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, assignedMember: memberId } : s))
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedTemplateId) {
      setError("Please select a template.");
      return;
    }
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
    // POST to backend here. For now, just alert:
    alert(
      `Project "${projectName}" created with priority "${priority}", start: ${startDate}, deadline: ${deadline}`
    );
    // Reset all
    setSelectedTemplateId("");
    setProjectName("");
    setPriority("moderate");
    setStartDate(new Date().toISOString().slice(0, 10));
    setDeadline(new Date().toISOString().slice(0, 10));
    setAssigned([]);
    navigate("/projects");
  }

  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center px-2 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-8 space-y-6"
      >
        <h2 className="text-2xl font-bold font-serif text-green-900 mb-2">
          Create Project
        </h2>
        {/* Template selection */}
        <div>
          <label className="block text-green-900 font-medium mb-1">
            Select a template
          </label>
          <select
            className="w-full px-4 py-2 rounded border border-green-200 bg-white text-green-900 font-sans"
            value={selectedTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Choose a template --
            </option>
            {taskTemplates.map((tpl) => (
              <option key={tpl._id} value={tpl._id}>
                {tpl.name}
              </option>
            ))}
          </select>
          {template && (
            <div className="mt-2 p-3 rounded bg-green-50 border border-green-100 text-green-800 text-sm">
              <div className="font-semibold">{template.name}</div>
              <div>{template.description}</div>
              <ul className="mt-2 ml-4 list-disc text-xs text-green-700">
                {template.subtasks.map((subId, idx) => {
                  const stpl = getSubtaskTemplateById(subId);
                  return (
                    <li key={idx}>
                      {stpl?.name} ({stpl?.estimatedDurationDays} day
                      {Number(stpl?.estimatedDurationDays) > 1 ? "s" : ""})
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {/* Only show the rest of the form if a template is selected */}
        {template && (
          <>
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
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
              <div className="flex-1">
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
              <label className="block text-green-900 font-medium mb-1">
                Subtasks & Assignment
              </label>
              <div className="space-y-2">
                {assigned.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-2 items-center bg-green-50 rounded p-2"
                  >
                    <div className="flex-1 text-green-900 font-sans">
                      <span className="font-semibold">{sub.name}</span>
                      <span className="ml-2 text-xs text-green-700">
                        ({roles.find((r) => r._id === sub.role)?.name})
                      </span>
                      <span className="ml-2 text-xs text-green-700">
                        {sub.estimatedDurationDays} day
                        {sub.estimatedDurationDays > 1 ? "s" : ""}
                      </span>
                    </div>
                    <select
                      className="px-2 py-2 rounded border border-green-200"
                      value={sub.assignedMember}
                      onChange={(e) => handleMemberChange(idx, e.target.value)}
                    >
                      {getMembersByRole(sub.role).map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
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
            disabled={!selectedTemplateId}
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
}
