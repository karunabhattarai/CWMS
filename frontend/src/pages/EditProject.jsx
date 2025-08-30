import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EditProjectDetailsForm from "../components/createProject/EditProjectDetailsForm";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function EditProjectPage() {
  const { taskId } = useParams();
  const [project, setProject] = useState(null);
  // const [subtaskTemplates, setSubtaskTemplates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [projectRes, roleRes, memberRes] = await Promise.all([
          axios.get(`${API_BASE}/api/task/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/role`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/member`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProject(projectRes.data);
        setRoles(roleRes.data || []);
        setMembers(memberRes.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load project data"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [taskId, token]);

  // const getSubtaskTemplateById = useCallback(
  //   (id) => subtaskTemplates.find((tpl) => tpl._id === id),
  //   [subtaskTemplates]
  // );

  const getMembersByRole = useCallback(
    (roleId) => {
      return members.filter((m) => {
        // Check if member has roles array and it's not empty
        if (!m.roles || !Array.isArray(m.roles) || m.roles.length === 0) {
          return false;
        }

        const hasRole = m.roles.some((role) => {
          if (!role) return false; // Skip null/undefined roles
          const memberRoleId = typeof role === "object" ? role._id : role;
          return (
            memberRoleId === roleId ||
            memberRoleId?.toString() === roleId?.toString()
          );
        });
        return hasRole;
      });
    },
    [members]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efeee8] flex items-center justify-center">
        <div className="text-center py-10 text-green-900 font-serif">
          Loading project...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#efeee8] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => navigate("/projects")}
            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#efeee8] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 text-center">
          <div className="text-gray-600 mb-4">Project not found</div>
          <button
            onClick={() => navigate("/projects")}
            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeee8] flex items-center justify-center px-2 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-6 sm:p-8 lg:p-10 overflow-hidden">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-serif text-green-900 text-center">
            Edit Project
          </h1>
          <p className="text-green-700 text-center mt-2">
            Modify your project details and subtask assignments
          </p>
        </div>

        <EditProjectDetailsForm
          project={project}
          roles={roles}
          members={members}
          getMembersByRole={getMembersByRole}
          navigate={navigate}
        />
      </div>
    </div>
  );
}
