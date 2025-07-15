import { detectCircularDependency } from '../utils/graphUtils.js';

const subtasks = [
  { dependencies: [] },       // 0
  { dependencies: [0] },      // 1 depends on 0
  { dependencies: [1] },      // 2 depends on 1
  { dependencies: [2, 1] }    // 3 depends on 2 and 1
];

console.log(detectCircularDependency(subtasks)); // Should print: false

const cyclicSubtasks = [
  { dependencies: [1] },      // 0 depends on 1
  { dependencies: [2] },      // 1 depends on 2
  { dependencies: [0] }       // 2 depends on 0 → cycle exists
];

console.log(detectCircularDependency(cyclicSubtasks)); // Should print: true
