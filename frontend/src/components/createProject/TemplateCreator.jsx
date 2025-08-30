import { useState, useMemo } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function TemplateCreator({ roles, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([
    {
      name: "",
      estimatedDurationDays: 1,
      role: roles[0]?._id || "",
      dependencies: [],
    },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Check for invalid dependencies after reordering
  const invalidDependencies = useMemo(() => {
    const invalid = [];
    subtasks.forEach((sub, idx) => {
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
  }, [subtasks]);

  function handleSubtaskChange(idx, field, value) {
    setSubtasks((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }

  function handleDependencyChange(idx, dependencies) {
    setSubtasks((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, dependencies } : s))
    );
  }

  function handleAddSubtask() {
    setSubtasks((prev) => [
      ...prev,
      {
        name: "",
        estimatedDurationDays: 1,
        role: roles[0]?._id || "",
        dependencies: [],
      },
    ]);
  }

  function handleRemoveSubtask(idx) {
    setSubtasks((prev) => {
      const newSubtasks = prev.filter((_, i) => i !== idx);
      // Update dependencies to account for removed subtask
      return newSubtasks.map((sub) => ({
        ...sub,
        dependencies: sub.dependencies
          .filter((dep) => dep !== idx) // Remove the deleted subtask
          .map((dep) => (dep > idx ? dep - 1 : dep)), // Adjust indices
      }));
    });
  }

  // Validate dependencies to prevent circular references
  function validateDependencies() {
    for (let i = 0; i < subtasks.length; i++) {
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

        const currentSubtask = subtasks[current];
        if (currentSubtask?.dependencies) {
          stack.push(...currentSubtask.dependencies);
        }
      }
    }
    return { isValid: true };
  }

  // Handle drag and drop reordering
  function handleDragEnd(result) {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    setSubtasks((prev) => {
      const newItems = Array.from(prev);
      const [reorderedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedItem);

      // Create proper index mapping for dependencies
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

      // If moving down
      if (source.index < destination.index) {
        for (let i = source.index + 1; i <= destination.index; i++) {
          properIndexMap[i] = i - 1;
        }
      }
      // If moving up
      else {
        for (let i = destination.index; i < source.index; i++) {
          properIndexMap[i] = i + 1;
        }
      }

      // Update dependencies based on new indices
      return newItems.map((item) => ({
        ...item,
        dependencies: item.dependencies
          .map((dep) => properIndexMap[dep])
          .filter((dep) => dep !== undefined)
          .sort((a, b) => a - b),
      }));
    });
  }

  // Auto-fix invalid dependencies
  function fixInvalidDependencies() {
    setSubtasks((prev) =>
      prev.map((sub, idx) => ({
        ...sub,
        dependencies: sub.dependencies.filter((dep) => dep < idx),
      }))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }
    if (subtasks.length === 0) {
      setError("At least one subtask is required.");
      return;
    }
    for (const sub of subtasks) {
      if (!sub.name.trim() || !sub.estimatedDurationDays || !sub.role) {
        setError("All subtasks must have name, duration, and role.");
        return;
      }
    }

    // Validate dependencies
    const depValidation = validateDependencies();
    if (!depValidation.isValid) {
      setError(depValidation.message);
      return;
    }

    // Check for invalid dependencies (dependencies on later subtasks)
    if (invalidDependencies.length > 0) {
      setError(
        "Some subtasks have invalid dependencies. Please fix dependencies that point to subtasks that come after them in the order."
      );
      return;
    }

    setError("");
    setSaving(true);

    try {
      // Create all subtasks as subtask templates first
      const subpartIds = [];
      const token = localStorage.getItem("token");

      for (const sub of subtasks) {
        const subRes = await axios.post(
          `${API_BASE}/api/subtask-template`,
          {
            name: sub.name,
            role: sub.role,
            estimatedDurationDays: sub.estimatedDurationDays,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        subpartIds.push({
          subtaskTemplate: subRes.data._id,
          dependencies: sub.dependencies, // Include dependencies
        });
      }

      // Now create the template linking those subtasks with dependencies
      const tplRes = await axios.post(
        `${API_BASE}/api/task-template`,
        {
          name,
          description,
          subtasks: subpartIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onSave(tplRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-6 border border-green-100 overflow-hidden"
    >
      <h2 className="text-2xl font-serif font-bold text-green-900 text-center">
        Create New Project Template
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-green-900 font-medium mb-1">
            Template Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-green-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-green-900 font-medium mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 rounded border border-green-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-green-900 mb-2">Subtasks</h3>

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
                        {invalid.subtaskName}" →{" "}
                        {invalid.invalidDeps
                          .map((dep) => {
                            const depSubtask = subtasks[dep];
                            return depSubtask?.name || `Subtask ${dep + 1}`;
                          })
                          .join(", ")}
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
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
          <Droppable droppableId="template-subtasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {subtasks.map((sub, idx) => (
                  <Draggable
                    key={`template-subtask-${idx}`}
                    draggableId={`template-subtask-${idx}`}
                    index={idx}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-green-50 border border-green-100 rounded-lg p-4 space-y-3 transition-all duration-200 ${
                          snapshot.isDragging
                            ? "shadow-xl bg-green-100 transform rotate-1"
                            : ""
                        }`}
                      >
                        {/* Subtask Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Index Number */}
                            <span className="text-green-700 font-semibold text-sm min-w-[24px]">
                              {idx + 1}.
                            </span>

                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="w-6 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-green-600 hover:text-green-800 hover:bg-green-200 rounded transition-colors"
                              title="Drag to reorder"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="currentColor"
                              >
                                <rect x="0" y="1" width="12" height="1" />
                                <rect x="0" y="4" width="12" height="1" />
                                <rect x="0" y="7" width="12" height="1" />
                                <rect x="0" y="10" width="12" height="1" />
                              </svg>
                            </div>

                            <span className="font-semibold text-green-900">
                              {sub.name || `Subtask ${idx + 1}`}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="text-rose-600 text-xl hover:text-rose-800"
                            onClick={() => handleRemoveSubtask(idx)}
                            disabled={subtasks.length === 1}
                            title="Remove subtask"
                          >
                            &times;
                          </button>
                        </div>

                        {/* Basic Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-green-700 text-sm font-medium mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded border border-green-200"
                              placeholder="Subtask name"
                              value={sub.name}
                              onChange={(e) =>
                                handleSubtaskChange(idx, "name", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-green-700 text-sm font-medium mb-1">
                              Role
                            </label>
                            <select
                              className="w-full px-3 py-2 rounded border border-green-200"
                              value={sub.role}
                              onChange={(e) =>
                                handleSubtaskChange(idx, "role", e.target.value)
                              }
                              required
                            >
                              {roles.map((role) => (
                                <option key={role._id} value={role._id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-green-700 text-sm font-medium mb-1">
                              Duration
                            </label>
                            <select
                              className="w-full px-3 py-2 rounded border border-green-200"
                              value={sub.estimatedDurationDays}
                              onChange={(e) =>
                                handleSubtaskChange(
                                  idx,
                                  "estimatedDurationDays",
                                  Number(e.target.value)
                                )
                              }
                              required
                            >
                              {[...Array(14).keys()].map((i) => {
                                const day = i + 1;
                                return (
                                  <option key={day} value={day}>
                                    {day} day{day > 1 ? "s" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        {/* Dependencies Section */}
                        <div>
                          <label className="block text-green-700 text-sm font-medium mb-2">
                            Dependencies (this subtask depends on)
                          </label>

                          {/* Valid Dependencies */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {subtasks.slice(0, idx).map((_, depIdx) => {
                              const isChecked =
                                sub.dependencies.includes(depIdx);
                              const depSubtask = subtasks[depIdx];

                              return (
                                <label
                                  key={depIdx}
                                  className="flex items-center space-x-2 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const newDependencies = e.target.checked
                                        ? [...sub.dependencies, depIdx]
                                        : sub.dependencies.filter(
                                            (d) => d !== depIdx
                                          );
                                      handleDependencyChange(
                                        idx,
                                        newDependencies
                                      );
                                    }}
                                    className="rounded border-green-300 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="text-green-700">
                                    {depSubtask.name || `Subtask ${depIdx + 1}`}
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          {/* Invalid Dependencies Warning + Manual Fix */}
                          {sub.dependencies.some((dep) => dep >= idx) && (
                            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                              <div className="text-amber-800 text-xs font-medium mb-2">
                                ⚠️ Invalid:
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {sub.dependencies
                                  .filter((dep) => dep >= idx)
                                  .map((depIdx) => {
                                    const depSubtask = subtasks[depIdx] || {};
                                    return (
                                      <label
                                        key={depIdx}
                                        className="flex items-center space-x-2 text-sm"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={true}
                                          onChange={(e) => {
                                            if (!e.target.checked) {
                                              const newDependencies =
                                                sub.dependencies.filter(
                                                  (d) => d !== depIdx
                                                );
                                              handleDependencyChange(
                                                idx,
                                                newDependencies
                                              );
                                            }
                                          }}
                                          className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="text-amber-700 line-through">
                                          {depSubtask.name ||
                                            `Subtask ${depIdx + 1}`}
                                        </span>
                                      </label>
                                    );
                                  })}
                              </div>
                              <p className="text-amber-700 text-xs mt-1">
                                Uncheck to remove
                              </p>
                            </div>
                          )}

                          {idx === 0 ? (
                            <p className="text-green-600 text-xs mt-1">
                              First subtask - no dependencies available
                            </p>
                          ) : sub.dependencies.length === 0 ? (
                            <p className="text-green-600 text-xs mt-1">
                              No dependencies (this subtask can start
                              immediately)
                            </p>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          type="button"
          className="mt-3 text-green-700 font-medium underline hover:text-green-900"
          onClick={handleAddSubtask}
        >
          + Add Another Subtask
        </button>
      </div>

      {error && <p className="text-sm text-rose-700">{error}</p>}

      <div className="flex gap-4 justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-100 text-green-900 font-semibold hover:bg-gray-200 transition"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800 transition"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>
    </form>
  );
}
