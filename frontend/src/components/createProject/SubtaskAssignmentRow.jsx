export default function SubtaskAssignmentRow({
  sub,
  idx,
  roles,
  subtasks,
  getMembersByRole,
  onMemberChange,
  onDurationChange,
  onStatusChange,
  onNameChange,
  onRoleChange,
  onDependencyChange,
  onRemove,
  dragHandleProps,
  isDragging,
  hasInvalidDependencies = false,
}) {
  // Get members that have the required role for this subtask
  const eligibleMembers = getMembersByRole(sub.role);
  const roleName =
    roles.find((r) => r._id === sub.role)?.name || "Unknown Role";
  const isCustomSubtask = !sub.subtaskTemplate;

  return (
    <div
      className={`w-full border rounded-lg p-4 shadow-sm transition-all duration-200 ${
        isDragging
          ? "shadow-xl bg-green-100 border-green-200"
          : hasInvalidDependencies
          ? "bg-amber-50 border-amber-200 border-l-4 border-l-amber-400"
          : "bg-green-50 border-green-100"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Index Number */}
        <div className="flex-shrink-0 w-8 text-center pt-1">
          <span className="text-green-700 font-semibold text-sm">
            {idx + 1}.
          </span>
        </div>

        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-green-600 hover:text-green-800 hover:bg-green-200 rounded transition-colors mt-1"
          title="Drag to reorder"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="0" y="1" width="12" height="1" />
            <rect x="0" y="4" width="12" height="1" />
            <rect x="0" y="7" width="12" height="1" />
            <rect x="0" y="10" width="12" height="1" />
          </svg>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:gap-6">
            {/* Subtask Title and Role */}
            <div className="flex-1 min-w-[140px]">
              {isCustomSubtask ? (
                <div>
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-green-200 rounded text-green-900 font-semibold text-base mb-1"
                    value={sub.name}
                    onChange={(e) => onNameChange(idx, e.target.value)}
                    placeholder="Subtask name"
                  />
                  <select
                    className="w-full px-2 py-1 border border-green-200 rounded text-green-700 text-sm"
                    value={sub.role}
                    onChange={(e) => onRoleChange(idx, e.target.value)}
                  >
                    <option value="">Select role...</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-green-200 rounded text-green-900 font-semibold text-base mb-1"
                    value={sub.name}
                    onChange={(e) => onNameChange(idx, e.target.value)}
                  />
                  <div className="text-green-700 text-sm">{roleName}</div>
                </div>
              )}
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

            {/* Status Selector */}
            <div className="w-full md:w-44">
              <label className="block text-green-700 text-xs font-medium mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-green-200 rounded-md bg-white text-sm text-green-900"
                value={sub.status || "Not Started"}
                onChange={(e) => onStatusChange(idx, e.target.value)}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
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

            {/* Remove Button */}
            <div className="w-full md:w-auto flex items-center justify-center md:justify-start">
              <button
                type="button"
                className="w-full md:w-auto p-2 mt-4 text-red-500 hover:text-red-700 hover:bg-red-200 rounded-lg hover:shadow-md transition-colors duration-200 text-md font-md"
                onClick={() => onRemove(idx)}
              >
                x
              </button>
            </div>
          </div>

          {/* Dependencies Section */}
          <div className="mt-4 pt-4 border-t border-green-200">
            <label className="block text-green-700 text-sm font-medium mb-2">
              Dependencies (this subtask depends on)
            </label>

            {/* Valid Dependencies */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {subtasks.slice(0, idx).map((_, depIdx) => {
                const isChecked = sub.dependencies.includes(depIdx);
                const depSubtask = subtasks[depIdx];

                return (
                  <label
                    key={depIdx}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const newDependencies = e.target.checked
                          ? [...sub.dependencies, depIdx]
                          : sub.dependencies.filter((d) => d !== depIdx);
                        onDependencyChange(idx, newDependencies);
                      }}
                      className="rounded border-green-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-green-700">
                      {depSubtask.name || `Subtask ${depIdx + 1}`}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Invalid Dependencies Warning + Manual Fix */}
            {sub.dependencies.some((dep) => dep >= idx) && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <div className="text-amber-800 text-xs font-medium mb-2">
                  ⚠️ Invalid:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {sub.dependencies
                    .filter((dep) => dep >= idx)
                    .map((depIdx) => {
                      const depSubtask = subtasks[depIdx] || {};
                      return (
                        <label
                          key={depIdx}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                const newDependencies = sub.dependencies.filter(
                                  (d) => d !== depIdx
                                );
                                onDependencyChange(idx, newDependencies);
                              }
                            }}
                            className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-amber-700 line-through">
                            {depSubtask.name || `Subtask ${depIdx + 1}`}
                          </span>
                        </label>
                      );
                    })}
                </div>
                <p className="text-amber-700 text-xs mt-1">Uncheck to remove</p>
              </div>
            )}

            {idx === 0 ? (
              <p className="text-green-600 text-xs mt-1">
                First subtask - no dependencies available
              </p>
            ) : sub.dependencies.length === 0 ? (
              <p className="text-green-600 text-xs mt-1">
                No dependencies (this subtask can start immediately)
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
