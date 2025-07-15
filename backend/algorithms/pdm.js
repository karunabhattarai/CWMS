
export function computePDM(subtasks) {
  const n = subtasks.length;
  const ES = new Array(n).fill(0);
  const EF = new Array(n).fill(0);
  const LS = new Array(n).fill(Infinity);
  const LF = new Array(n).fill(Infinity);
  const slack = new Array(n).fill(0);
  const isCritical = new Array(n).fill(false);

  // Step 1: Forward Pass (Calculate ES and EF)
  for (let i = 0; i < n; i++) {
    const task = subtasks[i];
    let maxEF = 0;
    for (const dep of task.dependencies || []) {
      const depEF = EF[dep];
      if (depEF > maxEF) maxEF = depEF;
    }
    ES[i] = maxEF;
    EF[i] = ES[i] + task.estimatedDurationDays;
  }

  const projectDuration = Math.max(...EF);

  // Step 2: Backward Pass (Calculate LF and LS)
  for (let i = n - 1; i >= 0; i--) {
    const task = subtasks[i];
    if (task.dependencies.length === 0 || i === n - 1) {
      LF[i] = projectDuration;
    } else {
      for (let j = 0; j < n; j++) {
        if (subtasks[j].dependencies.includes(i)) {
          if (LS[j] < LF[i]) {
            LF[i] = LS[j];
          }
        }
      }
    }
    LS[i] = LF[i] - task.estimatedDurationDays;
  }

  // Step 3: Slack and Critical Path
  for (let i = 0; i < n; i++) {
    slack[i] = LS[i] - ES[i];
    isCritical[i] = slack[i] === 0;
  }

  // Step 4: Build Output
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push({
      ES: ES[i],
      EF: EF[i],
      LS: LS[i],
      LF: LF[i],
      slack: slack[i],
      isCritical: isCritical[i]
    });
  }

  return result;
}
