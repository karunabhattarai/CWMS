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
              const stpl =
                typeof sub === "string" ? getSubtaskTemplateById(sub) : sub;
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
  );
}
