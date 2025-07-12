export default function RoleList({ roles, userRole, onEdit, onDelete }) {
  if (!roles.length) return <div>No roles found.</div>;
  return (
    <table className="w-full bg-white rounded-xl shadow-lg">
      <thead>
        <tr>
          <th className="p-3 text-left">Role Name</th>
          <th className="p-3 text-left">Description</th>
          <th className="p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((role) => (
          <tr key={role._id}>
            <td className="p-3">{role.name}</td>
            <td className="p-3">{role.description}</td>
            <td className="p-3 flex gap-2">
              {(userRole === "superadmin" || userRole === "manager") && (
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => onEdit(role)}
                >
                  Edit
                </button>
              )}
              {userRole === "superadmin" && (
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
  );
}
