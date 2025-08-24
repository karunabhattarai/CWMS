import { useState } from "react";
import FormModal from "../common/FormModal";
import { FormInput, FormTextarea } from "../common/FormFields";
import { useApi } from "../../hooks/useApi";

export default function RoleAddModal({ onClose, onRoleAdded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { loading, error, clearError, post } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    try {
      const result = await post("/api/role", { name, description });
      onRoleAdded(result);
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
      title="Add New Role"
      submitText="Add Role"
      submitVariant="success"
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
