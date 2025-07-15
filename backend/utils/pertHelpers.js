import pkg from 'jstat'; // For normal distribution functions; install with npm i jstat
const { jStat } = pkg;
export function buildPERTExplanation(levelized, subtasks, projectDuration, totalVariance, deadlineDays) {
  const explanationStages = [];

  levelized.forEach((group, idx) => {
    const names = group.map(i => subtasks[i].name || `Subtask ${i + 1}`).join(' and ');
    explanationStages.push(`Stage ${idx + 1}: ${names} ${group.length > 1 ? 'run in parallel' : 'runs'}.`);
  });

  explanationStages.push(`Estimated project duration based on PERT is approximately ${projectDuration.toFixed(2)} days.`);

  if (typeof deadlineDays === 'number') {
    const stdDev = Math.sqrt(totalVariance);
    const z = (deadlineDays - projectDuration) / stdDev;
    const probability = jStat.normal.cdf(z, 0, 1);

    explanationStages.push(`Given a deadline of ${deadlineDays} days, there's approximately a ${(probability * 100).toFixed(1)}% chance the project will be completed on time.`);
  }

  return explanationStages;
}
