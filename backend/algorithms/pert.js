export function computePERT(subtasks) {
  // Step 1: Calculate expected duration and variance for each subtask
  const pertData = subtasks.map(st => {
    const te = (st.optimistic + 4 * st.mostLikely + st.pessimistic) / 6;
    const variance = Math.pow((st.pessimistic - st.optimistic) / 6, 2);
    return {
      ...st,
      duration: te,
      variance,
      ES: 0,
      EF: 0,
      LS: 0,
      LF: 0,
      slack: 0,
      isCritical: false
    };
  });

  // Step 2: Forward Pass to calculate ES and EF
  for (let i = 0; i < pertData.length; i++) {
    const st = pertData[i];
    if (st.dependencies.length === 0) {
      st.ES = 0;
    } else {
      st.ES = Math.max(...st.dependencies.map(d => pertData[d].EF));
    }
    st.EF = st.ES + st.duration;
  }

  // Step 3: Determine project duration
  const projectDuration = Math.max(...pertData.map(st => st.EF));

  // Step 4: Backward Pass to calculate LS and LF
  for (let i = pertData.length - 1; i >= 0; i--) {
    const st = pertData[i];
    const dependentIndices = pertData
      .map((task, idx) => ({ task, idx }))
      .filter(entry => entry.task.dependencies.includes(i))
      .map(entry => entry.idx);

    if (dependentIndices.length === 0) {
      st.LF = projectDuration;
    } else {
      st.LF = Math.min(...dependentIndices.map(j => pertData[j].LS));
    }
    st.LS = st.LF - st.duration;
    st.slack = st.LS - st.ES;
    st.isCritical = st.slack === 0;
  }

  return {
    subtasks: pertData,
    projectDuration,
    totalVariance: pertData
      .filter(t => t.isCritical)
      .reduce((acc, t) => acc + t.variance, 0)
  };
}


