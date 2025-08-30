import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SubtaskAssignmentRow from "./SubtaskAssignmentRow";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function EditProjectDetailsForm({
  project,
  roles,
  members,
  getMembersByRole,
  navigate,
}) {
  // Initialize form data from the existing project
  const [projectName, setProjectName] = useState("");
  const [priority, setPriority] = useState("moderate");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");

  // Update form fields when project data loads
  useEffect(() => {
    if (project) {
      setProjectName(project.name || "");
      setPriority(project.priority || "moderate");
      setStartDate(
        project.startDate
          ? new Date(project.startDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );
      setDeadline(
        project.deadline
          ? new Date(project.deadline).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );
    }
  }, [project]);

  // Convert existing subtasks to the format expected by the form
  const initialAssigned = useMemo(() => {
    if (!project?.subtasks) {
      return [];
    }

    // Helper function to derive role from assigned member or subtask template
    const getRoleFromSubtask = (subtask) => {
      // First, try to get role from subtask template
      if (
        subtask.subtaskTemplate &&
        typeof subtask.subtaskTemplate === "object" &&
        subtask.subtaskTemplate.role
      ) {
        return typeof subtask.subtaskTemplate.role === "object"
          ? subtask.subtaskTemplate.role._id
          : subtask.subtaskTemplate.role;
      }

      // If no template role, try to infer from assigned member
      if (subtask.assignedMember) {
        const memberId =
          typeof subtask.assignedMember === "object"
            ? subtask.assignedMember._id
            : subtask.assignedMember;

        const member = members.find((m) => m._id === memberId);
        if (member && member.roles && member.roles.length > 0) {
          // Return the first role of the member (could be improved with more logic)
          const firstRole = member.roles[0];
          return typeof firstRole === "object" ? firstRole._id : firstRole;
        }
      }

      // Default to empty string if no role can be determined
      return "";
    };

    return project.subtasks.map((subtask, index) => {
      // Convert dependency subtask IDs to indices
      const dependencyIndices = (subtask.dependencies || [])
        .map((depId) => {
          // If dependency is an object (populated), get its _id
          const dependencyId = typeof depId === "object" ? depId._id : depId;
          // Find the index of this dependency in the subtasks array
          return project.subtasks.findIndex(
            (s) =>
              (typeof s._id === "object" ? s._id.toString() : s._id) ===
              (typeof dependencyId === "object"
                ? dependencyId.toString()
                : dependencyId)
          );
        })
        .filter((idx) => idx !== -1); // Remove invalid dependencies

      const mappedSubtask = {
        _id: subtask._id,
        subtaskTemplate: subtask.subtaskTemplate || null,
        name: subtask.name || `Subtask ${index + 1}`,
        role: getRoleFromSubtask(subtask),
        assignedMember: subtask.assignedMember
          ? typeof subtask.assignedMember === "object"
            ? subtask.assignedMember._id
            : subtask.assignedMember
          : "",
        estimatedDurationDays: subtask.estimatedDurationDays || 1,
        description: subtask.description || "",
        status: subtask.status || "Not Started",
        dependencies: dependencyIndices,
      };

      return mappedSubtask;
    });
  }, [project, members]);

  // State declarations
  const [assigned, setAssigned] = useState(initialAssigned);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    idx: null,
    subtaskName: "",
  });
  const [skipDeleteConfirmation, setSkipDeleteConfirmation] = useState(false);

  // Computed values
  // const totalDays = useMemo(
  //   () =>
  //     (assigned || []).reduce(
  //       (sum, s) => sum + (s.estimatedDurationDays || 0),
  //       0
  //     ),
  //   [assigned]
  // );

  // Check for missing roles
  const missingRoles = useMemo(() => {
    const missing = [];
    (assigned || []).forEach((sub, index) => {
      // Skip if role is not defined
      if (!sub.role) {
        missing.push({
          index: index + 1,
          roleName: "No Role Assigned",
          subtaskName: sub.name,
        });
        return;
      }

      const availableMembers = getMembersByRole(sub.role);
      if (availableMembers.length === 0) {
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

  // Handler functions (reused from ProjectDetailsForm)
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

  function handleStatusChange(idx, status) {
    setAssigned((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, status } : s))
    );
  }

  function handleRemove(idx) {
    if (skipDeleteConfirmation) {
      setAssigned((prev) => {
        const newAssigned = prev.filter((_, i) => i !== idx);
        return newAssigned.map((sub) => ({
          ...sub,
          dependencies: sub.dependencies
            .filter((dep) => dep !== idx)
            .map((dep) => (dep > idx ? dep - 1 : dep)),
        }));
      });
    } else {
      const subtaskName = assigned[idx]?.name || `Subtask ${idx + 1}`;
      setConfirmDelete({ show: true, idx, subtaskName });
    }
  }

  function confirmRemoveSubtask() {
    const { idx } = confirmDelete;
    setAssigned((prev) => {
      const newAssigned = prev.filter((_, i) => i !== idx);
      return newAssigned.map((sub) => ({
        ...sub,
        dependencies: sub.dependencies
          .filter((dep) => dep !== idx)
          .map((dep) => (dep > idx ? dep - 1 : dep)),
      }));
    });
    setConfirmDelete({ show: false, idx: null, subtaskName: "" });
  }

  function cancelRemoveSubtask() {
    setConfirmDelete({ show: false, idx: null, subtaskName: "" });
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

  function handleDependencyChange(idx, dependencies) {
    setAssigned((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, dependencies } : s))
    );
  }

  // Validate dependencies to prevent circular references
  function validateDependencies() {
    for (let i = 0; i < assigned.length; i++) {
      const visited = new Set();
      const stack = [i];

      while (stack.length > 0) {
        const current = stack.pop();
        if (visited.has(current)) {
          return {
            isValid: false,
            message: `Circular dependency detected involving subtask ${
              current + 1
            }`,
          };
        }
        visited.add(current);

        const currentSubtask = assigned[current];
        if (currentSubtask?.dependencies) {
          stack.push(...currentSubtask.dependencies);
        }
      }
    }
    return { isValid: true };
  }

  // Handle drag and drop reordering (same as original)
  function handleDragEnd(result) {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    setAssigned((prev) => {
      const newItems = Array.from(prev);
      const [reorderedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedItem);

      const properIndexMap = {};
      for (let i = 0; i < prev.length; i++) {
        if (i < source.index) {
          properIndexMap[i] = i;
        } else if (i === source.index) {
          properIndexMap[i] = destination.index;
        } else if (i <= destination.index) {
          properIndexMap[i] = i - 1;
        } else {
          properIndexMap[i] = i;
        }
      }

      if (source.index < destination.index) {
        for (let i = source.index + 1; i <= destination.index; i++) {
          properIndexMap[i] = i - 1;
        }
      } else {
        for (let i = destination.index; i < source.index; i++) {
          properIndexMap[i] = i + 1;
        }
      }

      return newItems.map((item) => ({
        ...item,
        dependencies: item.dependencies
          .map((dep) => properIndexMap[dep])
          .filter((dep) => dep !== undefined)
          .sort((a, b) => a - b),
      }));
    });
  }

  // Check for invalid dependencies
  const invalidDependencies = useMemo(() => {
    const invalid = [];
    assigned.forEach((sub, idx) => {
      const invalidDeps = sub.dependencies.filter((dep) => dep >= idx);
      if (invalidDeps.length > 0) {
        invalid.push({
          subtaskIndex: idx,
          subtaskName: sub.name,
          invalidDeps: invalidDeps,
        });
      }
    });
    return invalid;
  }, [assigned]);

  function fixInvalidDependencies() {
    setAssigned((prev) =>
      prev.map((sub, idx) => ({
        ...sub,
        dependencies: sub.dependencies.filter((dep) => dep < idx),
      }))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErrors([]);
    setWarnings([]);

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

    if (missingRoles.length > 0) {
      const roleNames = missingRoles.map((mr) => mr.roleName).join(", ");
      clientErrors.push(
        `Missing members for roles: ${roleNames}. Please create members with these roles first.`
      );
    }

    const unassignedSubtasks = assigned.filter((sub) => !sub.assignedMember);
    if (unassignedSubtasks.length > 0) {
      clientErrors.push(
        `${unassignedSubtasks.length} subtask(s) have no assigned members.`
      );
    }

    const depValidation = validateDependencies();
    if (!depValidation.isValid) {
      clientErrors.push(depValidation.message);
    }

    if (invalidDependencies.length > 0) {
      clientErrors.push(
        "Some subtasks have invalid dependencies. Please fix dependencies that point to subtasks that come after them in the order."
      );
    }

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);

    try {
      // Update the existing project
      const requestData = {
        name: projectName.trim(),
        deadline,
        startDate,
        priority,
        subtasks: (assigned || []).map((s) => ({
          _id: s._id, // Include ID for existing subtasks
          name: s.name,
          role: s.role,
          subtaskTemplate: s.subtaskTemplate || null,
          assignedMember: s.assignedMember || null,
          estimatedDurationDays: s.estimatedDurationDays || 1,
          description: s.description || "",
          dependencies: (s.dependencies || [])
            .map((depIdx) => {
              // Convert index back to subtask ID
              const depSubtask = assigned[depIdx];
              return depSubtask ? depSubtask._id : null;
            })
            .filter((id) => id !== null), // Remove any null dependencies
          status: s.status || "Not Started",
        })),
      };

      console.log("Sending update request with data:", requestData);

      const response = await axios.put(
        `${API_BASE}/api/task/${project._id}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.warnings?.length > 0) {
        setWarnings(response.data.warnings);
        setTimeout(() => {
          navigate(`/projects/${project._id}`);
        }, 2000);
      } else {
        navigate(`/projects`);
      }
    } catch (err) {
      console.error("Project update error:", err);

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors([err.response.data.message]);
      } else {
        setErrors(["Failed to update project. Please try again."]);
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
      {/* Custom Confirmation Modal (same as original) */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Remove Subtask?
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  This action will remove "{confirmDelete.subtaskName}" and any
                  dependencies on this subtask.
                </p>
                <label className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) =>
                      setSkipDeleteConfirmation(e.target.checked)
                    }
                  />
                  Don't ask again for this session
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="flex-1 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  onClick={cancelRemoveSubtask}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 bg-red-600 border border-transparent rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  onClick={confirmRemoveSubtask}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Missing Roles Warning (same as original) */}
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

          {/* Invalid Dependencies Warning */}
          {invalidDependencies.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Invalid Dependencies
                  </h3>
                  <div className="mt-1 text-sm text-amber-700">
                    <p className="mb-2">Fix dependencies on later subtasks:</p>
                    <ul className="list-disc list-inside space-y-1 mb-3">
                      {invalidDependencies.map((invalid, idx) => (
                        <li key={idx}>
                          <strong>Subtask {invalid.subtaskIndex + 1}</strong> "
                          {invalid.subtaskName}" → "
                          {invalid.invalidDeps
                            .map((dep) => {
                              const depSubtask = assigned[dep];
                              return depSubtask?.name || `Subtask ${dep + 1}`;
                            })
                            .join(", ")}
                          "
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={fixInvalidDependencies}
                      className="inline-flex items-center px-3 py-1.5 border border-amber-300 text-xs font-medium rounded text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Auto-fix Dependencies
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="subtasks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {assigned.map((sub, idx) => (
                    <Draggable
                      key={`subtask-${idx}`}
                      draggableId={`subtask-${idx}`}
                      index={idx}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={
                            snapshot.isDragging
                              ? "transform rotate-1 shadow-lg"
                              : ""
                          }
                        >
                          <SubtaskAssignmentRow
                            sub={sub}
                            idx={idx}
                            roles={roles}
                            subtasks={assigned}
                            getMembersByRole={getMembersByRole}
                            onMemberChange={handleMemberChange}
                            onDurationChange={handleDurationChange}
                            onStatusChange={handleStatusChange}
                            onNameChange={handleNameChange}
                            onRoleChange={handleRoleChange}
                            onDependencyChange={handleDependencyChange}
                            onRemove={handleRemove}
                            dragHandleProps={provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            hasInvalidDependencies={invalidDependencies.some(
                              (invalid) => invalid.subtaskIndex === idx
                            )}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

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
            onClick={() => navigate(`/projects/${project._id}`)}
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
            {saving ? "Updating..." : "Update Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
