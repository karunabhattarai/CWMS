import { useState, useMemo } from "react";
import {
  taskTemplates as initialTemplates,
  subtaskTemplates,
  roles,
  members,
} from "../dummyData.jsx";
import { useNavigate } from "react-router-dom";
import ProjectTemplateTabs from "../components/ProjectTemplateTabs";
import ProjectDetailsForm from "../components/ProjectDetailsForm";

// Helper functions (as before)
function getTemplateById(id, templates) {
  return templates.find((tpl) => tpl._id === id);
}
function getSubtaskTemplateById(id) {
  return subtaskTemplates.find((tpl) => tpl._id === id);
}
function getMembersByRole(roleId) {
  return members.filter((m) => m.roles.includes(roleId));
}

export default function CreateProjectPage() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [tab, setTab] = useState("select");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const template = useMemo(
    () => getTemplateById(selectedTemplateId, templates),
    [selectedTemplateId, templates]
  );
  const navigate = useNavigate();

  // Handle new template creation
  function handleTemplateCreated(newTpl) {
    setTemplates((prev) => [...prev, newTpl]);
    setTab("select");
    setSelectedTemplateId(newTpl._id);
  }

  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center px-2 py-8">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-0 overflow-hidden">
        <ProjectTemplateTabs
          tab={tab}
          setTab={setTab}
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
          roles={roles}
          onTemplateCreated={handleTemplateCreated}
          getSubtaskTemplateById={getSubtaskTemplateById}
        />
        {/* Show details form only if a template is selected and we're on the "select" tab */}
        {tab === "select" && template && (
          <ProjectDetailsForm
            template={template}
            roles={roles}
            members={members}
            getMembersByRole={getMembersByRole}
            getSubtaskTemplateById={getSubtaskTemplateById}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}
