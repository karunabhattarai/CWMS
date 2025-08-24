import { useState } from "react";
import FormModal from "../common/FormModal";
import { FormInput, FormTextarea } from "../common/FormFields";
import { useApi } from "../../hooks/useApi";

export default function RoleEditModal({ role, onClose, onRoleEdited }) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || "");
  const { loading, error, clearError, put } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    try {
      const result = await put(`/api/role/${role._id}`, { name, description });
      onRoleEdited(result);
      onClose();
    } catch {
      // Error handled by useApi hook
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Role"
      submitText="Save"
      submitVariant="primary"
      loading={loading}
      error={error}
      clearError={clearError}
    >
      <FormInput
        placeholder="Role Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        required
      />
      <FormTextarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      />
    </FormModal>
  );
}
