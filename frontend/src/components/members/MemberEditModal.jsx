import { useState } from "react";
import FormModal from "../common/FormModal";
import { FormInput } from "../common/FormFields";
import RoleSelector from "../common/RoleSelector";
import { useApi } from "../../hooks/useApi";

export default function MemberEditModal({
  member,
  roles,
  onClose,
  onMemberEdited,
}) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [selectedRoles, setSelectedRoles] = useState(
    member.roles?.map((role) => (typeof role === "string" ? role : role._id)) ||
      []
  );
  const { loading, error, clearError, put } = useApi();

  const addRole = (roleId) => {
    if (!selectedRoles.includes(roleId)) {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const removeRole = (roleId) => {
    setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return;
    }

    try {
      const result = await put(`/api/member/${member._id}`, {
        name,
        email,
        roles: selectedRoles,
      });
      onMemberEdited(result);
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
      title="Edit Member"
      submitText="Save"
      submitVariant="primary"
      loading={loading}
      error={error}
      clearError={clearError}
    >
      <FormInput
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        required
      />
      <FormInput
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      <RoleSelector
        roles={roles}
        selectedRoles={selectedRoles}
        onRoleAdd={addRole}
        onRoleRemove={removeRole}
        disabled={loading}
        variant="blue"
      />
    </FormModal>
  );
}
