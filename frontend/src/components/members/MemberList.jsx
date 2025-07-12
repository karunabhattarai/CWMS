export default function MemberList({ members, roles }) {
  if (!members.length) return <div>No members found.</div>;

  const getRoleNames = (roleIds) =>
    roles
      .filter((r) => roleIds.includes(r._id))
      .map((r) => r.name)
      .join(", ");

  return (
    <table className="w-full bg-white rounded-xl shadow-lg">
      <thead>
        <tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Email</th>
          <th className="p-3 text-left">Roles</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member._id}>
            <td className="p-3">{member.name}</td>
            <td className="p-3">{member.email}</td>
            <td className="p-3">{getRoleNames(member.roles)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
