export default function SubtaskAssignmentRow({
  sub,
  idx,
  roles,
  members,
  getMembersByRole,
  onMemberChange,
  onDurationChange,
}) {
  return (
    <div className="w-full bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-start md:gap-6">
      {/* Subtask Title and Role */}
      <div className="flex-1 min-w-[140px]">
        <div className="text-green-900 font-semibold text-base">{sub.name}</div>
        <div className="text-green-700 text-sm">
          {roles.find((r) => r._id === sub.role)?.name}
        </div>
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
          className="w-full px-3 py-2 border border-green-200 rounded-md bg-white text-sm text-green-900"
          value={sub.assignedMember}
          onChange={(e) => onMemberChange(idx, e.target.value)}
        >
          {getMembersByRole(sub.role).map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
