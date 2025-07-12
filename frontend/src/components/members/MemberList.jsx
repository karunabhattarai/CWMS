export default function MemberList({
  members,
  userRole,
  onEdit,
  onDelete,
}) {
  if (!members.length) return <div>No members found.</div>;

  const getRoleNames = (rolesArr = []) =>
    rolesArr.map((r) => r.name).join(", ");

  return (
    <table className="w-full bg-white rounded-xl shadow-lg">
      <thead>
        <tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Email</th>
          <th className="p-3 text-left">Roles</th>
          <th className="p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member._id}>
            <td className="p-3">{member.name}</td>
            <td className="p-3">{member.email}</td>
            <td className="p-3">
              {getRoleNames(Array.isArray(member.roles) ? member.roles : [])}
            </td>
            <td className="p-3 flex gap-2">
              {(userRole === "superadmin" || userRole === "manager") && (
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => onEdit(member)}
                >
                  Edit
                </button>
              )}
              {userRole === "superadmin" && (
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => onDelete(member._id)}
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
