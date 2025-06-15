export default function TemplateForm({
  roles,
  newTemplate,
  setNewTemplate,
  onSubmit,
  onCancel,
  error,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-green-900 font-medium mb-1">
          Template Name
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 rounded border border-green-200"
          value={newTemplate.name}
          onChange={(e) =>
            setNewTemplate((tpl) => ({ ...tpl, name: e.target.value }))
          }
          required
        />
      </div>
      <div>
        <label className="block text-green-900 font-medium mb-1">
          Description
        </label>
        <textarea
          className="w-full px-3 py-2 rounded border border-green-200"
          value={newTemplate.description}
          onChange={(e) =>
            setNewTemplate((tpl) => ({ ...tpl, description: e.target.value }))
          }
        />
      </div>
      <div>
        <label className="block text-green-900 font-medium mb-1">
          Subparts
        </label>
        <div className="space-y-2">
          {newTemplate.subtasks.map((sub, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row gap-2 items-center"
            >
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded border border-green-200"
                placeholder="Subpart name"
                value={sub.name}
                onChange={(e) => {
                  const newSubs = [...newTemplate.subtasks];
                  newSubs[idx].name = e.target.value;
                  setNewTemplate((tpl) => ({ ...tpl, subtasks: newSubs }));
                }}
                required
              />
              <input
                type="number"
                min={1}
                className="w-full sm:w-24 px-3 py-2 rounded border border-green-200"
                placeholder="Days"
                value={sub.estimatedDurationDays}
                onChange={(e) => {
                  const newSubs = [...newTemplate.subtasks];
                  newSubs[idx].estimatedDurationDays = Number(e.target.value);
                  setNewTemplate((tpl) => ({ ...tpl, subtasks: newSubs }));
                }}
                required
              />
              <select
                className="px-2 py-2 rounded border border-green-200"
                value={sub.role}
                onChange={(e) => {
                  const newSubs = [...newTemplate.subtasks];
                  newSubs[idx].role = e.target.value;
                  setNewTemplate((tpl) => ({ ...tpl, subtasks: newSubs }));
                }}
                required
              >
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="px-2 py-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200"
                onClick={() => {
                  setNewTemplate((tpl) => ({
                    ...tpl,
                    subtasks: tpl.subtasks.filter((_, i) => i !== idx),
                  }));
                }}
                disabled={newTemplate.subtasks.length === 1}
                aria-label="Remove subpart"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 text-green-700 font-medium underline hover:text-green-900"
          onClick={() =>
            setNewTemplate((tpl) => ({
              ...tpl,
              subtasks: [
                ...tpl.subtasks,
                {
                  name: "",
                  estimatedDurationDays: 1,
                  role: roles[0]?._id || "",
                },
              ],
            }))
          }
        >
          + Add Subpart
        </button>
      </div>
      {error && <div className="text-rose-700 text-sm">{error}</div>}
      <div className="flex gap-2">
        <button
          type="button"
          className="w-1/2 px-4 py-2 rounded bg-gray-100 text-green-900 font-semibold hover:bg-gray-200 transition"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-1/2 px-4 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800 transition"
        >
          Save Template
        </button>
      </div>
    </form>
  );
}
