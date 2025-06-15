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
    <div className="flex flex-col md:flex-row md:items-center gap-3 bg-green-50 rounded-xl p-4 box-border border border-green-100 shadow-sm">
      <div className="flex-1 min-w-[140px]">
        <div className="font-semibold text-green-900">{sub.name}</div>
        <div className="text-xs text-green-700">
          {roles.find((r) => r._id === sub.role)?.name}
        </div>
      </div>
      <div className="flex flex-col w-full md:w-40">
        <label className="text-xs text-green-700 mb-1 md:mb-0 md:text-right md:mr-2">
          Duration
        </label>
        <select
          className="px-3 py-2 rounded border border-green-200 bg-white text-green-900 font-sans box-border w-full"
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
      <div className="flex flex-col w-full md:w-56">
        <label className="text-xs text-green-700 mb-1 md:mb-0 md:text-right md:mr-2">
          Assigned Member
        </label>
        <select
          className="px-3 py-2 rounded border border-green-200 bg-white text-green-900 font-sans box-border w-full"
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
