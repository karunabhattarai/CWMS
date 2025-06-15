import TemplateSelector from "./TemplateSelector";
import TemplateCreator from "./TemplateCreator";

export default function ProjectTemplateTabs({
  tab,
  setTab,
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
  roles,
  onTemplateCreated,
  getSubtaskTemplateById,
}) {
  return (
    <>
      <div className="flex border-b border-green-100">
        <button
          className={`flex-1 py-4 text-lg font-semibold transition ${
            tab === "select"
              ? "text-green-900 bg-green-50 border-b-2 border-green-700"
              : "text-green-700 bg-white hover:bg-green-50"
          }`}
          onClick={() => setTab("select")}
        >
          Use Existing Template
        </button>
        <button
          className={`flex-1 py-4 text-lg font-semibold transition ${
            tab === "create"
              ? "text-green-900 bg-green-50 border-b-2 border-green-700"
              : "text-green-700 bg-white hover:bg-green-50"
          }`}
          onClick={() => setTab("create")}
        >
          Create New Template
        </button>
      </div>
      <div className="p-8">
        {tab === "select" ? (
          <TemplateSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            setSelectedTemplateId={setSelectedTemplateId}
            getSubtaskTemplateById={getSubtaskTemplateById}
          />
        ) : (
          <TemplateCreator
            roles={roles}
            onSave={onTemplateCreated}
            onCancel={() => setTab("select")}
          />
        )}
      </div>
    </>
  );
}
