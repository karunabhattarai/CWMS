export const getSchedulingSuggestion = (criticalPathDuration, deadlineDuration, cpmResult) => {
  // If deadline is less than critical path, suggest extending or shortening critical subtasks

  // Find critical subtasks that could be shortened (non-zero duration)
  const criticalSubtasks = cpmResult
    .map((s, i) => ({ ...s, index: i }))
    .filter(s => s.isCritical && s.estimatedDurationDays > 1);

  if (criticalSubtasks.length === 0) {
    return "Extend the deadline as no critical subtasks can be shortened";
  }

  // Suggest shortening the longest critical subtask as an example
  const longestCritical = criticalSubtasks.reduce((max, curr) =>
    curr.estimatedDurationDays > max.estimatedDurationDays ? curr : max
  );

  return `Extend the deadline or shorten the duration of subtask #${longestCritical.index + 1} (currently ${longestCritical.estimatedDurationDays} days)`;
};
