export default function RoleList({ roles }) {
  if (!roles.length) return <div>No roles found.</div>;
  return (
    <table className="w-full bg-white rounded-xl shadow-lg">
      <thead>
        <tr>
          <th className="p-3 text-left">Role Name</th>
          <th className="p-3 text-left">Description</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((role) => (
          <tr key={role._id}>
            <td className="p-3">{role.name}</td>
            <td className="p-3">{role.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
