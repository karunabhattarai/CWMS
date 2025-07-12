import { useState, useEffect } from "react";

const EMPTY_PROJECT = {
  name: "",
  subparts: [{ name: "", days: 1 }],
};

export default function OnboardingProjectStep({
  project,
  setProject,
  onNext,
  onBack,
}) {
  const [error, setError] = useState("");

  // Always start with empty fields, not demo values
  useEffect(() => {
    if (!project || !project.name) setProject(EMPTY_PROJECT);
    // eslint-disable-next-line
  }, []);

  const handleSubpartChange = (idx, field, value) => {
    const updated = { ...project };
    updated.subparts[idx][field] = field === "days" ? Number(value) : value;
    setProject(updated);
  };

  const addSubpart = () => {
    setProject({
      ...project,
      subparts: [...project.subparts, { name: "", days: 1 }],
    });
  };

  const removeSubpart = (idx) => {
    if (project.subparts.length === 1) return;
    setProject({
      ...project,
      subparts: project.subparts.filter((_, i) => i !== idx),
    });
  };

  const validate = () => {
    if (!project.name.trim()) return "Project name is required.";
    if (!project.subparts.length) return "At least one subpart is required.";
    for (let s of project.subparts) {
      if (!s.name.trim()) return "Each subpart must have a name.";
      if (!s.days || s.days < 1)
        return "Each subpart must have at least 1 day.";
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
        Project Template
      </h2>
      <p className="text-cyan-800 font-sans mb-6">
        Set up a project template with subparts and estimated durations.
      </p>
      <div className="mb-6">
        <label className="block text-cyan-900 font-sans mb-2 font-semibold">
          Project Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-green-500 font-sans text-lg"
          value={project.name}
          onChange={(e) => setProject({ ...project, name: e.target.value })}
          placeholder="e.g. TNC Townhall"
          autoComplete="off"
        />
      </div>
      <div>
        <div className="font-semibold text-cyan-900 mb-2 text-sm">Subparts</div>
        <div className="space-y-3">
          {project.subparts.map((sub, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#efeee8] rounded-xl p-3"
            >
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded-xl border border-cyan-200 font-sans"
                value={sub.name}
                onChange={(e) =>
                  handleSubpartChange(idx, "name", e.target.value)
                }
                placeholder={`Subpart #${idx + 1} Name`}
                autoComplete="off"
              />
              <input
                type="number"
                min={1}
                className="w-full sm:w-24 px-3 py-2 rounded-xl border border-cyan-200 font-sans"
                value={sub.days}
                onChange={(e) =>
                  handleSubpartChange(idx, "days", e.target.value)
                }
                placeholder="Days"
                autoComplete="off"
              />
              {project.subparts.length > 1 && (
                <button
                  className="sm:ml-1 text-red-400 hover:bg-red-50 rounded-full p-2 transition self-start sm:self-auto"
                  onClick={() => removeSubpart(idx)}
                  title="Remove subpart"
                  type="button"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          className="mt-4 text-green-700 font-medium underline hover:text-green-900"
          onClick={addSubpart}
          type="button"
        >
          + Add Subpart
        </button>
      </div>
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
