import { topologicalSort, detectCircularDependency,levelizedTopologicalSort } from '../utils/graphUtils.js';

const subtasks1 = [
  { dependencies: [] },       // 0
  { dependencies: [0] },      // 1 depends on 0
  { dependencies: [1] },      // 2 depends on 1
  { dependencies: [2, 1] }    // 3 depends on 2 and 1
];

console.log('Has cycle:', detectCircularDependency(subtasks1)); // false
console.log('Topological order:', topologicalSort(subtasks1)); // e.g. [0,1,2,3]

const cyclicSubtasks = [
  { dependencies: [1] },      // 0 depends on 1
  { dependencies: [2] },      // 1 depends on 2
  { dependencies: [0] }       // 2 depends on 0 → cycle exists
];

console.log('Has cycle:', detectCircularDependency(cyclicSubtasks)); // true
try {
  console.log('Topological order:', topologicalSort(cyclicSubtasks)); // should throw
} catch(e) {
  console.error('Cycle detected during topological sort:', e.message);
}
const subtasks = [
  { name: "A", dependencies: [] },          // 0
  { name: "B", dependencies: [] },          // 1
  { name: "C", dependencies: [0, 1] },       // 2 depends on A, B
  { name: "D", dependencies: [0, 1] },       // 3 depends on A, B
  { name: "E", dependencies: [2, 3] }        // 4 depends on C, D
];

console.log('Has cycle:', detectCircularDependency(subtasks)); // should be false

try {
  console.log('Topological order:', topologicalSort(subtasks)); // should succeed
  console.log('Topological order:', levelizedTopologicalSort(subtasks));
} catch (e) {
  console.error('Cycle detected during topological sort:', e.message);
}

