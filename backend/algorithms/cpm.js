// the algo for the critical path method

import { topologicalSort } from '../utils/graphUtils.js';

export function computeCPM(subtasks) {
  const n = subtasks.length;

  // Result object for each subtask
  const result = Array(n).fill().map(() => ({
    ES: 0, EF: 0, LS: 0, LF: 0, slack: 0, isCritical: false
  }));

  // Topological sort
  const topoOrder = topologicalSort(subtasks);
  console.log('Topological order:', topoOrder);

  // --------- FORWARD PASS ---------
  for (const i of topoOrder) {
    const deps = subtasks[i].dependencies || [];

    let maxEF = 0;
    for (const dep of deps) {
      maxEF = Math.max(maxEF, result[dep].EF);
    }

    result[i].ES = maxEF;
    result[i].EF = maxEF + subtasks[i].estimatedDurationDays;
  }

  const projectDuration = Math.max(...result.map(t => t.EF));

  // --------- BACKWARD PASS ---------
  const reverseTopo = [...topoOrder].reverse();

  for (const i of reverseTopo) {
    const dependents = [];

    for (let j = 0; j < n; j++) {
      if ((subtasks[j].dependencies || []).includes(i)) {
        dependents.push(j);
      }
    }

    if (dependents.length === 0) {
      // Last node: it must finish at project duration
      result[i].LF = projectDuration;
    } else {
      result[i].LF = Math.min(...dependents.map(d => result[d].LS));
    }

    result[i].LS = result[i].LF - subtasks[i].estimatedDurationDays;
    result[i].slack = result[i].LS - result[i].ES;
    result[i].isCritical = result[i].slack === 0;
  }

  return result;
}
