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










// below outdated | did not work | trail

//steps
  // 1. Build the task graph (DAG)
  // 2. Perform forward pass (calculate ES and EF)
  // 3. Perform backward pass (calculate LS and LF)
  // 4. Calculate float and identify critical path
//   // return
// export function calculateCPM(subtasks) {
//   // Step 1: Map subtasks by ID for quick access
//   const subtaskMap = new Map();
//   subtasks.forEach(st => subtaskMap.set(st._id.toString(), st));

//   // Step 2: Build graph and in-degree map
//   const graph = new Map();
//   const inDegree = new Map();
//   subtasks.forEach(st => {
//     const id = st._id.toString();
//     graph.set(id, []);
//     inDegree.set(id, 0);
//   });

//   // Populate graph edges
//   subtasks.forEach(st => {
//     const id = st._id.toString();
//     for (const dep of st.dependencies || []) {
//       const depId = dep._id ? dep._id.toString() : dep.toString();
//       graph.get(depId).push(id);
//       inDegree.set(id, inDegree.get(id) + 1);
//     }
//   });

//   // Step 3: Topological sort using Kahn's algorithm
//   const queue = [];
//   const topoOrder = [];

//   for (const [id, deg] of inDegree.entries()) {
//     if (deg === 0) queue.push(id);
//   }

//   while (queue.length) {
//     const current = queue.shift();
//     topoOrder.push(current);
//     for (const neighbor of graph.get(current)) {
//       inDegree.set(neighbor, inDegree.get(neighbor) - 1);
//       if (inDegree.get(neighbor) === 0) {
//         queue.push(neighbor);
//       }
//     }
//   }

//   // Step 4: Forward Pass (calculate ES and EF)
//   const ES = {};
//   const EF = {};
//   for (const id of topoOrder) {
//     const st = subtaskMap.get(id);
//     const duration = st.estimatedDurationDays || 0;
//     const deps = st.dependencies || [];

//     ES[id] = Math.max(0, ...deps.map(dep =>
//       EF[dep._id ? dep._id.toString() : dep.toString()] || 0
//     ));
//     EF[id] = ES[id] + duration;
//   }

//   // Step 5: Backward Pass (calculate LS and LF)
//   const LS = {};
//   const LF = {};

//   const projectDuration = Math.max(...Object.values(EF));
//   const reversed = [...topoOrder].reverse();

//   for (const id of reversed) {
//     const children = graph.get(id);
//     if (children.length === 0) {
//       LF[id] = projectDuration;
//     } else {
//       LF[id] = Math.min(...children.map(childId => LS[childId]));
//     }
//     const duration = subtaskMap.get(id).estimatedDurationDays || 0;
//     LS[id] = LF[id] - duration;
//   }

//   // Step 6: Total Float and Critical Path
//   const annotatedSubtasks = subtasks.map(st => {
//     const id = st._id.toString();
//     const float = LS[id] - ES[id];
//     return {
//       _id: st._id,
//       name: st.name || st.subtaskTemplate?.name || 'Unnamed',
//       estimatedDurationDays: st.estimatedDurationDays,
//       dependencies: st.dependencies,
//       ES: ES[id],
//       EF: EF[id],
//       LS: LS[id],
//       LF: LF[id],
//       float,
//       isCritical: float === 0
//     };
//   });

//   const criticalPath = annotatedSubtasks
//     .filter(st => st.isCritical)
//     .map(st => st._id);

//   return {
//     annotatedSubtasks,
//     criticalPath,
//     projectDuration
//   };
// }

// talako functuion obsolete we did arkai tarikalle , dual pass wih indexing
// for the reusable function to make and update the dependencies in subtask
// dont label same for 2 subtasks - issue cause garxa since name bata resolve garirako xa

// export async function resolveSubtaskDependenciesByName(subtasks, taskId) {
//   const nameToIdMap = new Map();
//   const savedSubtasks = [];

//   // First pass: Create all subtasks without dependencies
//   for (const s of subtasks) {
//     const subtask = new Subtask({
//       task: taskId,
//       name: s.name,
//       estimatedDurationDays: s.estimatedDurationDays,
//       assignedMember: s.assignedMember || null,
//       // Ignore dependencies for now
//     });
//     await subtask.save();
//     nameToIdMap.set(s.name, subtask._id);
//     savedSubtasks.push({ subtask, raw: s });
//   }

//   // Second pass: Resolve dependencies
//   for (const { subtask, raw } of savedSubtasks) {
//     if (raw.dependencies && Array.isArray(raw.dependencies)) {
//       const resolved = raw.dependencies.map(depName => {
//         const id = nameToIdMap.get(depName);
//         if (!id) {
//           throw new Error(`Dependency "${depName}" not found in current task subtasks.`);
//         }
//         return id;
//       });
//       subtask.dependencies = resolved;
//       await subtask.save();
//     }
//   }

// //   return savedSubtasks.map(({ subtask }) => subtask._id); // return the new subtask IDs
// // } obsolete since arko banako xa by index resolve garne bhanera
