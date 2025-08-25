import { useState } from "react";
import FormModal from "../common/FormModal";
import { FormInput } from "../common/FormFields";
import RoleSelector from "../common/RoleSelector";
import { useApi } from "../../hooks/useApi";

export default function MemberAddModal({ onClose, onMemberAdded, roles }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const { loading, error, clearError, post } = useApi();

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
      // First try to register the user (for new users, this will send verification email)
      try {
        await post("/api/user/register", {
          name,
          email,
          role: "employee",
          memberRoles: selectedRoles,
        });

        // If user registration succeeds, fetch updated members to get the new member
        // The member was created automatically by registerUser
        onMemberAdded(null); // Trigger refresh
        onClose();
      } catch (userError) {
        if (userError.message.includes("User already exists")) {
          // User exists, just create/update member record
          const result = await post("/api/member", {
            name,
            email,
            roles: selectedRoles,
          });
          onMemberAdded(result);
          onClose();
        } else {
          throw userError;
        }
      }
    } catch {
      // Error handled by useApi hook
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add New Member"
      submitText="Add Member"
      submitVariant="success"
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
        variant="green"
      />
    </FormModal>
  );
}
