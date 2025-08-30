export default function MemberList({
  members,
  roles = [],
  userRole,
  onEdit,
  onDelete,
}) {
  if (!members.length) return <div>No members found.</div>;

  const getRoleName = (roleObjOrId) => {
    if (typeof roleObjOrId === "object" && roleObjOrId?.name) {
      return roleObjOrId.name;
    }
    if (typeof roleObjOrId === "string") {
      const found = roles.find((r) => r._id === roleObjOrId);
      return found ? found.name : roleObjOrId;
    }
    return "";
  };

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left whitespace-nowrap">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left w-48 whitespace-nowrap">Roles</th>
              <th className="p-3 text-left whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{member.name}</td>
                <td className="p-3">{member.email}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-0.5">
                    {(member.roles || []).map((role) => (
                      <span
                        key={typeof role === "string" ? role : role._id}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-sm max-w-[110px] truncate"
                        title={getRoleName(role)}
                      >
                        {getRoleName(role)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 flex flex-wrap gap-2">
                  {(userRole === "superadmin" || userRole === "manager") && (
                    <button
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => onEdit(member)}
                    >
                      Edit
                    </button>
                  )}
                  {userRole === "superadmin" && (
                    <button
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
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
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {members.map((member) => (
          <div
            key={member._id}
            className="bg-white p-4 rounded-xl shadow-md space-y-2"
          >
            <div>
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-gray-600">{member.email}</p>
            </div>

            <div className="flex flex-wrap gap-1">
              {(member.roles || []).map((role) => (
                <span
                  key={typeof role === "string" ? role : role._id}
                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-sm"
                >
                  {getRoleName(role)}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {(userRole === "superadmin" || userRole === "manager") && (
                <button
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => onEdit(member)}
                >
                  Edit
                </button>
              )}
              {userRole === "superadmin" && (
                <button
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => onDelete(member._id)}
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
