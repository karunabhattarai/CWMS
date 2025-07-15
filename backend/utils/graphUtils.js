// dag validators , topological sort

export function detectCircularDependency(subtasks) {
  const visited = new Set();
  const recStack = new Set();

  function dfs(i) {
    if (!visited.has(i)) {
      visited.add(i);
      recStack.add(i);

      for (const dep of subtasks[i].dependencies) {
        if (!visited.has(dep) && dfs(dep)) {
          return true;
        } else if (recStack.has(dep)) {
          return true;
        }
      }
    }
    recStack.delete(i);
    return false;
  }

  for (let i = 0; i < subtasks.length; i++) {
    if (dfs(i)) return true;
  }
  return false;
}



export function topologicalSort(subtasks) {
  const visited = new Set();
  const tempMarks = new Set();
  const sorted = [];

  function visit(i) {
    if (tempMarks.has(i)) {
      throw new Error('Cycle detected');
    }
    if (!visited.has(i)) {
      tempMarks.add(i);
      for (const dep of subtasks[i].dependencies) {
        visit(dep);
      }
      tempMarks.delete(i);
      visited.add(i);
      sorted.push(i);
    }
  }

  for (let i = 0; i < subtasks.length; i++) {
    if (!visited.has(i)) {
      visit(i);
    }
  }
//   return sorted.reverse(); // reverse so that dependencies come before dependents
return sorted;
}




export function levelizedTopologicalSort(subtasks) {
  const inDegree = Array(subtasks.length).fill(0);
  const graph = Array(subtasks.length).fill(null).map(() => []);
  
  // Build graph and compute in-degrees
  for (let i = 0; i < subtasks.length; i++) {
    for (const dep of subtasks[i].dependencies) {
      graph[dep].push(i);
      inDegree[i]++;
    }
  }

  const result = [];
  let queue = [];

  // Start with tasks that have no dependencies
  for (let i = 0; i < subtasks.length; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  while (queue.length > 0) {
    const currentLevel = [...queue];
    result.push(currentLevel);
    const nextQueue = [];

    for (const node of currentLevel) {
      for (const neighbor of graph[node]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          nextQueue.push(neighbor);
        }
      }
    }

    queue = nextQueue;
  }

  // Check for cycle
  const totalVisited = result.reduce((sum, level) => sum + level.length, 0);
  if (totalVisited !== subtasks.length) {
    throw new Error("Cycle detected in dependencies");
  }

  return result;
}




