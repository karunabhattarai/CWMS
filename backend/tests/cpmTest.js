import { computeCPM } from "../algorithms/cpm.js";
import { detectCircularDependency,levelizedTopologicalSort } from '../utils/graphUtils.js';

const subtasks = [
  { name: "A", estimatedDurationDays: 1, dependencies: [] },
  { name: "B", estimatedDurationDays: 2, dependencies: [0] },
  { name: "C", estimatedDurationDays: 3, dependencies: [0, 1] }
];

const result = computeCPM(subtasks);
console.log(JSON.stringify(result, null, 2));



//direct check for function computeCPM
const subtasks1 = [
  { name: "A", estimatedDurationDays: 3, dependencies: [] },
  { name: "B", estimatedDurationDays: 2, dependencies: [] },
  { name: "C", estimatedDurationDays: 4, dependencies: [0, 1] },
  { name: "D", estimatedDurationDays: 1, dependencies: [0, 1] },
  { name: "E", estimatedDurationDays: 2, dependencies: [2, 3] }
];
const result1 = computeCPM(subtasks1);
console.log(result1);



const subtasks11 = [
  { _id: '1', estimatedDurationDays: 3, dependencies: [] },
  { _id: '2', estimatedDurationDays: 5, dependencies: ['1'] }, // depends on 1
  { _id: '3', estimatedDurationDays: 2, dependencies: ['1'] }, // depends on 1
  { _id: '4', estimatedDurationDays: 1, dependencies: ['2', '3'] } // depends on 2 & 3
];

// Map _id to index for CPM input
const indexMap = new Map();
subtasks.forEach((st, i) => indexMap.set(st._id, i));

const indexedSubtasks = subtasks11.map(st => ({
  estimatedDurationDays: st.estimatedDurationDays,
  dependencies: st.dependencies.map(depId => indexMap.get(depId))
}));

console.log('Has cycle:', detectCircularDependency(indexedSubtasks));
console.log('Topological sort:', topologicalSort(indexedSubtasks));
console.log('Levelized sort:', levelizedTopologicalSort(indexedSubtasks));
console.log('CPM result:', computeCPM(indexedSubtasks));
