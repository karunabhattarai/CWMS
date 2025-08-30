export default function TemplateSelector({
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
  getSubtaskTemplateById,
}) {
  const template = templates.find((tpl) => tpl._id === selectedTemplateId);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div>
        <label className="block text-green-900 font-medium mb-1">
          Select a Template
        </label>
        <select
          className="w-full px-4 py-2 rounded border border-green-200 bg-white text-green-900 font-sans"
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          required
        >
          <option value="" disabled>
            -- Choose a template --
          </option>
          {templates.map((tpl) => (
            <option key={tpl._id} value={tpl._id}>
              {tpl.name}
            </option>
          ))}
        </select>
      </div>
      {template && (
        <div className="border border-green-100 bg-green-50 rounded-lg p-4 overflow-auto max-h-60">
          <div className="font-bold text-green-900 text-base mb-1">
            {template.name}
          </div>
          <div className="text-green-800 text-sm mb-2">
            {template.description || "No description provided."}
          </div>
          <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
            {template.subtasks.map((sub, idx) => {
              // Handle the different cases: string, object with subtaskTemplate, fully populated subtask template
              let subtaskTemplateData = null;

              if (typeof sub === "string") {
                // It's just an ObjectId string
                subtaskTemplateData = getSubtaskTemplateById(sub);
              } else if (sub && typeof sub === "object") {
                if (sub.name && sub.estimatedDurationDays !== undefined) {
                  // Already a populated subtask template object
                  subtaskTemplateData = sub;
                } else if (sub.subtaskTemplate) {
                  // It's an object with a reference to a subtask template
                  if (typeof sub.subtaskTemplate === "string") {
                    subtaskTemplateData = getSubtaskTemplateById(
                      sub.subtaskTemplate
                    );
                  } else if (typeof sub.subtaskTemplate === "object") {
                    subtaskTemplateData = sub.subtaskTemplate;
                  }
                } else if (sub._id) {
                  // It might be a subtask template object with _id
                  subtaskTemplateData = sub;
                }
              }

              // Debug logging to help troubleshoot
              if (!subtaskTemplateData) {
                console.warn("Could not resolve subtask template for:", sub);
              }

              return (
                <li key={idx}>
                  {subtaskTemplateData
                    ? `${subtaskTemplateData.name || `Subtask ${idx + 1}`} (${
                        subtaskTemplateData.estimatedDurationDays || 1
                      } day${
                        Number(subtaskTemplateData.estimatedDurationDays || 1) >
                        1
                          ? "s"
                          : ""
                      })`
                    : `Subtask ${idx + 1} (Unknown template)`}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
