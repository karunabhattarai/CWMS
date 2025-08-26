export default function SubtaskAssignmentRow({
  sub,
  idx,
  roles,
  getMembersByRole,
  onMemberChange,
  onDurationChange,
}) {
  // Get members that have the required role for this subtask
  const eligibleMembers = getMembersByRole(sub.role);
  const roleName =
    roles.find((r) => r._id === sub.role)?.name || "Unknown Role";

  return (
    <div className="w-full bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-start md:gap-6">
      {/* Subtask Title and Role */}
      <div className="flex-1 min-w-[140px]">
        <div className="text-green-900 font-semibold text-base">{sub.name}</div>
        <div className="text-green-700 text-sm">{roleName}</div>
        {eligibleMembers.length === 0 && (
          <div className="text-red-600 text-xs mt-1">
            ⚠️ No members available for this role
          </div>
        )}
      </div>

      {/* Duration Selector */}
      <div className="w-full md:w-40">
        <label className="block text-green-700 text-xs font-medium mb-1">
          Duration
        </label>
        <select
          className="w-full px-3 py-2 border border-green-200 rounded-md bg-white text-sm text-green-900"
          value={sub.estimatedDurationDays}
          onChange={(e) => onDurationChange(idx, Number(e.target.value))}
        >
          {[...Array(14).keys()].map((i) => {
            const day = i + 1;
            return (
              <option key={day} value={day}>
                {day} day{day > 1 ? "s" : ""}
              </option>
            );
          })}
        </select>
      </div>

      {/* Assigned Member Selector */}
      <div className="w-full md:w-56">
        <label className="block text-green-700 text-xs font-medium mb-1">
          Assigned Member
        </label>
        <select
          className={`w-full px-3 py-2 border rounded-md bg-white text-sm ${
            eligibleMembers.length === 0
              ? "border-red-300 text-red-500 bg-red-50"
              : "border-green-200 text-green-900"
          }`}
          value={sub.assignedMember}
          onChange={(e) => onMemberChange(idx, e.target.value)}
          disabled={eligibleMembers.length === 0}
        >
          {eligibleMembers.length === 0 ? (
            <option value="">No members available</option>
          ) : (
            <>
              <option value="">-- Select a member --</option>
              {eligibleMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
    </div>
  );
}
