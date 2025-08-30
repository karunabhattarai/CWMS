import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProjectTemplateTabs from "../components/createProject/ProjectTemplateTabs";
import ProjectDetailsForm from "../components/createProject/ProjectDetailsForm";
import { useToast } from "../context/ToastContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CreateProjectPage() {
  const [templates, setTemplates] = useState([]);
  const [subtaskTemplates, setSubtaskTemplates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("select");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const [templateRes, subtaskRes, roleRes, memberRes] = await Promise.all(
          [
            axios.get(`${API_BASE}/api/task-template`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            axios.get(`${API_BASE}/api/subtask-template`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            axios.get(`${API_BASE}/api/role`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            axios.get(`${API_BASE}/api/member`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]
        );
        setTemplates(templateRes.data || []);
        setSubtaskTemplates(subtaskRes.data || []);
        setRoles(roleRes.data || []);
        setMembers(memberRes.data || []);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        showToast("Project creation UI failed to load initial data.");
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [token]);

  const getTemplateById = useCallback(
    (id) => templates.find((tpl) => tpl._id === id),
    [templates]
  );
  const getSubtaskTemplateById = useCallback(
    (id) => subtaskTemplates.find((tpl) => tpl._id === id),
    [subtaskTemplates]
  );
  const getMembersByRole = useCallback(
    (roleId) => {
      return members.filter((m) => {
        // Handle both object roles and string roles
        const hasRole = m.roles.some((role) => {
          const memberRoleId = typeof role === "object" ? role._id : role;
          return memberRoleId === roleId || memberRoleId === roleId.toString();
        });
        return hasRole;
      });
    },
    [members]
  );
  const template = useMemo(
    () => getTemplateById(selectedTemplateId),
    [selectedTemplateId, getTemplateById]
  );

  // For new template creation
  const handleTemplateCreated = (newTpl) => {
    setTemplates((prev) => [...prev, newTpl]);
    setTab("select");
    setSelectedTemplateId(newTpl._id);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#efeee8] flex items-center justify-center px-2 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-6 sm:p-8 lg:p-10 overflow-hidden">
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
        {tab === "select" && template && (
          <ProjectDetailsForm
            template={template}
            roles={roles}
            getMembersByRole={getMembersByRole}
            getSubtaskTemplateById={getSubtaskTemplateById}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}
