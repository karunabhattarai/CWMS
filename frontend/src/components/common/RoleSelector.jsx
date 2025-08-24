export default function RoleSelector({
  roles,
  selectedRoles,
  onRoleAdd,
  onRoleRemove,
  label = "Roles",
  disabled = false,
  variant = "green", // green or blue
}) {
  const variants = {
    green: {
      selected: "bg-green-100 text-green-900",
      removeButton:
        "bg-green-300 hover:bg-green-500 text-green-900 hover:text-white",
      available:
        "bg-gray-100 text-green-800 border-green-300 hover:bg-green-200",
      activeAvailable: "bg-green-600 text-white border-green-700",
    },
    blue: {
      selected: "bg-blue-100 text-blue-900",
      removeButton:
        "bg-blue-300 hover:bg-blue-500 text-blue-900 hover:text-white",
      available: "bg-gray-100 text-blue-800 border-blue-300 hover:bg-blue-200",
      activeAvailable: "bg-blue-600 text-white border-blue-700",
    },
  };

  const colors = variants[variant];

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium text-gray-700">{label}</label>

      {/* Selected roles pills */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedRoles.map((roleId) => {
          const role = roles.find((r) => r._id === roleId);
          if (!role) return null;
          return (
            <span
              key={roleId}
              className={`flex items-center ${colors.selected} rounded-full px-3 py-1 text-sm`}
            >
              {role.name}
              <button
                type="button"
                className={`ml-2 w-5 h-5 flex items-center justify-center rounded-full ${colors.removeButton}`}
                onClick={() => onRoleRemove(roleId)}
                disabled={disabled}
                aria-label={`Remove ${role.name}`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      {/* Available roles buttons */}
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <button
            key={role._id}
            type="button"
            className={`px-3 py-1 rounded-full border ${
              selectedRoles.includes(role._id)
                ? colors.activeAvailable
                : colors.available
            }`}
            onClick={() => onRoleAdd(role._id)}
            disabled={selectedRoles.includes(role._id) || disabled}
          >
            {role.name}
          </button>
        ))}
      </div>
    </div>
  );
}
