import { useState } from "react";
import TemplateForm from "./TemplateForm";

export default function ProjectModal({
  show,
  onClose,
  templates,
  roles,
  showTemplateForm,
  setShowTemplateForm,
  selectedTemplateId,
  setSelectedTemplateId,
  newTemplate,
  setNewTemplate,
  templateFormError,
  handleCreateTemplate,
  onCreateProject, // callback: (projectName, templateId) => void
}) {
  const [step, setStep] = useState(1); // 1 = template selection, 2 = project creation
  const [projectName, setProjectName] = useState("");
  const [projectError, setProjectError] = useState("");

  // Reset modal state when closed
  function handleClose() {
    setStep(1);
    setProjectName("");
    setProjectError("");
    setSelectedTemplateId(null);
    setShowTemplateForm(false);
    onClose();
  }

  // Proceed to project creation step
  function handleContinue() {
    if (!selectedTemplateId) return;
    setStep(2);
  }

  // Handle project creation
  function handleProjectCreate(e) {
    e.preventDefault();
    if (!projectName.trim()) {
      setProjectError("Project name is required.");
      return;
    }
    setProjectError("");
    onCreateProject(projectName, selectedTemplateId);
    handleClose();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg sm:max-w-xl p-6 sm:p-8 mx-2 sm:mx-0 max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-4 right-4 text-green-700 hover:text-green-900 text-2xl"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
        {/* Step 1: Template selection or creation */}
        {step === 1 && !showTemplateForm && (
          <>
            <h2 className="font-serif text-2xl font-bold text-green-900 mb-6">
              Start a New Project
            </h2>
            <div>
              <div className="text-green-900 font-medium mb-2">
                Choose a template:
              </div>
              <ul className="space-y-2 max-h-40 overflow-y-auto mb-4">
                {templates.map((tpl) => (
                  <li key={tpl._id}>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-lg border transition 
                        ${
                          selectedTemplateId === tpl._id
                            ? "bg-green-50 border-green-400 ring-2 ring-green-300"
                            : "border-green-100 hover:bg-green-50"
                        }`}
                      onClick={() => setSelectedTemplateId(tpl._id)}
                    >
                      <span className="font-semibold text-green-800">
                        {tpl.name}
                      </span>
                      <span className="block text-xs text-green-700">
                        {tpl.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-center my-3">
                <span className="text-green-700 font-medium">or</span>
              </div>
              <button
                className="w-full mb-2 px-4 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800 transition"
                onClick={() => setShowTemplateForm(true)}
              >
                + Create New Project Template
              </button>
              <button
                className={`w-full px-4 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800 transition ${
                  !selectedTemplateId ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!selectedTemplateId}
                onClick={handleContinue}
              >
                Continue with Selected Template
              </button>
            </div>
          </>
        )}
        {/* Step 1b: Template creation */}
        {step === 1 && showTemplateForm && (
          <>
            <h2 className="font-serif text-2xl font-bold text-green-900 mb-6">
              Create New Project Template
            </h2>
            <TemplateForm
              roles={roles}
              newTemplate={newTemplate}
              setNewTemplate={setNewTemplate}
              onSubmit={handleCreateTemplate}
              onCancel={() => setShowTemplateForm(false)}
              error={templateFormError}
            />
          </>
        )}
        {/* Step 2: Project creation */}
        {step === 2 && (
          <form onSubmit={handleProjectCreate} className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-green-900 mb-2">
              Create Project
            </h2>
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
              {projectError && (
                <div className="text-rose-700 text-sm mt-1">{projectError}</div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="w-1/2 px-4 py-2 rounded bg-gray-100 text-green-900 font-semibold hover:bg-gray-200 transition"
                onClick={handleClose}
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
        )}
      </div>
    </div>
  );
}
