export default function RoleList({ roles, userRole, onEdit, onDelete }) {
  if (!roles.length) return <div>No roles found.</div>;

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Role Name</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{role.name}</td>
                <td className="p-3">{role.description}</td>
                <td className="p-3 flex flex-wrap gap-2">
                  {(userRole === "superadmin" || userRole === "manager") && (
                    <button
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => onEdit(role)}
                    >
                      Edit
                    </button>
                  )}
                  {userRole === "superadmin" && (
                    <button
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => onDelete(role._id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {roles.map((role) => (
          <div
            key={role._id}
            className="bg-white p-4 rounded-xl shadow-md space-y-2"
          >
            <div>
              <p className="text-sm font-semibold">{role.name}</p>
              <p className="text-xs text-gray-600">{role.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(userRole === "superadmin" || userRole === "manager") && (
                <button
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => onEdit(role)}
                >
                  Edit
                </button>
              )}
              {userRole === "superadmin" && (
                <button
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => onDelete(role._id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
