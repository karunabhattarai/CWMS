export default function TemplateSelector({
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
  getSubtaskTemplateById,
}) {
  const template = templates.find((tpl) => tpl._id === selectedTemplateId);
  return (
    <div>
      <label className="block text-green-900 font-medium mb-1">
        Select a template
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
      {template && (
        <div className="mt-2 p-3 rounded bg-green-50 border border-green-100 text-green-800 text-sm">
          <div className="font-semibold">{template.name}</div>
          <div>{template.description}</div>
          <ul className="mt-2 ml-4 list-disc text-xs text-green-700">
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
