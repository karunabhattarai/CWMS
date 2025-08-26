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

export default function OnboardingProjectStep({
  project,
  setProject,
  onNext,
  onBack,
  roles = [],
}) {
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

  // Initialize from project prop only once
  useEffect(() => {
    if (project && project.name && !name) {
      setName(project.name);
      setDescription(project.description || "");
      if (project.subparts && project.subparts.length > 0) {
        setSubtasks(
          project.subparts.map((sub) => ({
            name: sub.name,
            estimatedDurationDays: sub.days || sub.estimatedDurationDays || 1,
            role: sub.role || roles[0]?._id || "",
            dependencies: sub.dependencies || [],
          }))
        );
      }
    } else if (!project || !project.name) {
      // Initialize with empty state if no project
      if (!name) setName("");
      if (!description) setDescription("");
      if (subtasks.length === 0) {
        setSubtasks([
          {
            name: "",
            estimatedDurationDays: 1,
            role: roles[0]?._id || "",
            dependencies: [],
          },
        ]);
      }
    }
  }, [project, roles, name, description, subtasks.length]);

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
    if (subtasks.length === 1) return;
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

  const validate = () => {
    const nameError = validateRequired(name, "Template name");
    if (nameError) return nameError;

    if (subtasks.length === 0) return "At least one subtask is required.";
    for (const sub of subtasks) {
      const subNameError = validateRequired(sub.name, "Subtask name");
      if (subNameError) return subNameError;

      if (!sub.estimatedDurationDays || !sub.role) {
        return "All subtasks must have name, duration, and role.";
      }
    }

    // Validate dependencies
    const depValidation = validateDependencies();
    if (!depValidation.isValid) {
      return depValidation.message;
    }

    return "";
  };

  async function handleNext() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setSaving(true);

    try {
      // Create all subtasks as subtask templates first
      const subpartIds = [];
      for (const sub of subtasks) {
        const subRes = await axios.post(
          `${API_BASE}/api/subtask-template`,
          {
            name: sub.name,
            role: sub.role,
            estimatedDurationDays: sub.estimatedDurationDays,
          },
          getAuthHeaders()
        );
        subpartIds.push({
          subtaskTemplate: subRes.data._id,
          dependencies: sub.dependencies, // Include dependencies
        });
      }

      // Now create the template linking those subtasks
      const tplRes = await axios.post(
        `${API_BASE}/api/task-template`,
        {
          name,
          description,
          subtasks: subpartIds,
        },
        getAuthHeaders()
      );

      // Save project data to localStorage draft
      const projectData = {
        name,
        description,
        subparts: subtasks.map((sub) => ({
          name: sub.name,
          days: sub.estimatedDurationDays,
          role: sub.role,
          dependencies: sub.dependencies,
        })),
        _id: tplRes.data._id,
        saved: true,
      };

      const allData = loadDraft();
      allData.project = projectData;
      saveDraft(allData);

      // Update project with the saved template data
      setProject(projectData);

      console.log("Project template saved:", projectData);
      onNext();
    } catch (error) {
      console.error("Error saving project template:", error);
      setError(error.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingContainer>
      <h2 className="text-2xl font-bold font-serif text-cyan-900 mb-2">
        Create Project Template
      </h2>
      <p className="text-cyan-800 font-sans mb-6">
        Set up a reusable project template with subtasks, assign roles, and
        estimated durations.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-cyan-900 font-sans mb-2 font-semibold">
            Template Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans text-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website Development Project"
            autoComplete="off"
            required
          />
        </div>

        <div>
          <label className="block text-cyan-900 font-sans mb-2 font-semibold">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this template"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-cyan-900 mb-4">Subtasks</h3>
        <div className="space-y-4">
          {subtasks.map((sub, idx) => (
            <div key={idx} className="bg-[#efeee8] rounded-xl p-4 space-y-3">
              {/* Subtask Header */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-900">
                  Subtask {idx + 1}
                </span>
                <button
                  type="button"
                  className="text-red-500 hover:bg-red-50 rounded-full p-2 transition"
                  onClick={() => handleRemoveSubtask(idx)}
                  disabled={subtasks.length === 1}
                  title="Remove subtask"
                >
                  ×
                </button>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-cyan-700 text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans"
                    placeholder="Subtask name"
                    value={sub.name}
                    onChange={(e) =>
                      handleSubtaskChange(idx, "name", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-cyan-700 text-sm font-medium mb-1">
                    Role
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans"
                    value={sub.role}
                    onChange={(e) =>
                      handleSubtaskChange(idx, "role", e.target.value)
                    }
                    required
                  >
                    <option value="">Assign Role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-cyan-700 text-sm font-medium mb-1">
                    Duration
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans"
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
                <label className="block text-cyan-700 text-sm font-medium mb-2">
                  Dependencies (this subtask depends on)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {subtasks.map((_, depIdx) => {
                    if (depIdx === idx) return null; // Can't depend on itself

                    const isChecked = sub.dependencies.includes(depIdx);
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
                              : sub.dependencies.filter((d) => d !== depIdx);
                            handleDependencyChange(idx, newDependencies);
                          }}
                          className="rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-cyan-700">
                          {depSubtask.name || `Subtask ${depIdx + 1}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {sub.dependencies.length === 0 && (
                  <p className="text-cyan-600 text-xs mt-1">
                    No dependencies (this subtask can start immediately)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 text-green-700 font-medium underline hover:text-green-900"
          onClick={handleAddSubtask}
        >
          + Add Subtask
        </button>
      </div>

      <ErrorMessage error={error} />

      <OnboardingNavigation
        onPrevious={onBack}
        onNext={handleNext}
        onSkip={null}
        nextLabel={saving ? "Saving Template..." : "Next: Review"}
        previousLabel="← Back to Members"
        nextDisabled={saving}
        showSkip={false}
        loading={saving}
      />
    </OnboardingContainer>
  );
}
