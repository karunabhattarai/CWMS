// imports from /algorithms and calls them


//main idea for CPM
// export const runCPM = (subtasks) => { ... };  // Main CPM calculation
// export const checkCircularDependencies = (subtasks) => { ... }; // returns true/false or list of cycles
// export const checkDeadlineFeasibility = (subtasks, deadline) => { ... }; // returns overrun info or null
// export const suggestOptimizations = (subtasks) => { ... }; // returns suggestions like parallelization or reducing durations


import Subtask from '../models/Subtask.js';
import { computeCPM } from '../algorithms/cpm.js';

/**
 * Run CPM on a task's subtasks, update them with CPM results.
 * @param {String} taskId
 * @returns {Array} updated subtasks with CPM data
 */
export async function runCPMForTask(taskId) {
  // Fetch subtasks with dependencies populated
  const subtasks = await Subtask.find({ task: taskId });

  // Build dependency graph as indexes for CPM input
  const idToIndex = new Map();
  subtasks.forEach((subtask, i) => idToIndex.set(subtask._id.toString(), i));

  // Prepare CPM input format with dependencies as indexes
  const cpmInput = subtasks.map(subtask => ({
    estimatedDurationDays: subtask.estimatedDurationDays,
    dependencies: subtask.dependencies
      .map(depId => idToIndex.get(depId.toString()))
      .filter(idx => idx !== undefined),
  }));

  // Run CPM calculation
  const cpmResults = computeCPM(cpmInput);

  // Map CPM results back to subtasks and update DB
  const updates = subtasks.map((subtask, i) => {
    const res = cpmResults[i];
    // Calculate actual dates from ES, EF, LS, LF if needed, here assuming days offset from task start
    // For now just store numbers, you can convert to Date later based on your logic
    return Subtask.updateOne(
      { _id: subtask._id },
      {
        earliestStart: res.ES,
        earliestFinish: res.EF,
        latestStart: res.LS,
        latestFinish: res.LF,
        float: res.slack,
        isCritical: res.isCritical,
      }
    );
  });

  await Promise.all(updates);

  // Return updated subtasks after update
  return Subtask.find({ task: taskId });
}
