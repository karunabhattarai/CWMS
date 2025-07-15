import { detectCircularDependency, levelizedTopologicalSort } from '../utils/graphUtils.js';
import { computeCPM } from '../algorithms/cpm.js';
import Task from '../models/Task.js';
import Subtask from '../models/Subtask.js';
import { getSchedulingSuggestion } from '../services/SchedulingSuggestionService.js';
export const scheduleTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Fetch task and subtasks with dependencies populated
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Populate subtasks with dependencies populated fully
    const subtasks = await Subtask.find({ task: task._id }).populate('dependencies');

    console.log('Raw subtasks with dependencies:', subtasks);

    // Format subtasks for CPM
    const formattedSubtasks = subtasks.map(st => ({
      _id: st._id.toString(),
      estimatedDurationDays: st.estimatedDurationDays,
      dependencies: st.dependencies.map(d => d._id.toString()),
    }));

    console.log('Formatted Subtasks for CPM:', formattedSubtasks);

    // Map _id to index for CPM input
    const indexMap = new Map();
    formattedSubtasks.forEach((st, i) => indexMap.set(st._id, i));

    // Build CPM-ready array with indices instead of IDs for dependencies
    const indexedSubtasks = formattedSubtasks.map(st => ({
      estimatedDurationDays: st.estimatedDurationDays,
      dependencies: st.dependencies.map(depId => indexMap.get(depId)),
    }));

    // STEP 1: Check circular dependencies
    if (detectCircularDependency(indexedSubtasks)) {
      return res.status(400).json({ message: 'Circular dependency detected among subtasks' });
    }

    // STEP 2: Run CPM
    const cpmResult = computeCPM(indexedSubtasks);

    // STEP 3: Deadline check
    const criticalPathDuration = Math.max(...cpmResult.map(s => s.EF));
    const now = task.startDate || new Date();
    const deadline = new Date(task.deadline);
    const deadlineDuration = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)); // in days


    // updating logic for better resonse | extracting critical path subtasks
    const criticalPathFull = subtasks.map((st, i) => ({
        _id: st._id,
        name: st.name || `Subtask ${i + 1}`,
        duration: st.estimatedDurationDays,
        float: cpmResult[i].slack,
        isCritical: cpmResult[i].isCritical
        }));
    const levelized = levelizedTopologicalSort(indexedSubtasks);
    const criticalPath = criticalPathFull.filter(st => st.isCritical);
    // up logic updated
    // deadline check
    if (criticalPathDuration > deadlineDuration) {
        
        const suggestion = getSchedulingSuggestion(criticalPathDuration, deadlineDuration, cpmResult); 
        const explanation = buildExplanation(levelized, subtasks);
        
        return res.status(400).json({
            message: 'Deadline is too short for this task based on CPM',
            criticalPathDuration,
            availableDays: deadlineDuration,
            suggestion,
            // cpmData: cpmResult,
            criticalPath: {
                subtasks: criticalPath, //.map(({ _id, name, duration, float }) => ({ _id, name, duration, float })),
                totalDuration: criticalPathDuration
            },
            topologicalOrder: levelized,
            explanation
        });
    }

    // STEP 4: Save CPM results back to subtasks
    // for (let i = 0; i < subtasks.length; i++) {
    //   const st = subtasks[i];
    //   const cpm = cpmResult[i];

    //   const start = new Date(now.getTime() + cpm.ES * 24 * 60 * 60 * 1000);
    //   const finish = new Date(now.getTime() + cpm.EF * 24 * 60 * 60 * 1000);
    //   const latestStart = new Date(now.getTime() + cpm.LS * 24 * 60 * 60 * 1000);
    //   const latestFinish = new Date(now.getTime() + cpm.LF * 24 * 60 * 60 * 1000);

    //   st.earliestStart = start;
    //   st.earliestFinish = finish;
    //   st.latestStart = latestStart;
    //   st.latestFinish = latestFinish;
    //   st.float = cpm.slack;
    //   st.isCritical = cpm.isCritical;

    //   await st.save();
    // }
    // updated for parallel and better
    await Promise.all(
    subtasks.map((st, i) => {
        const cpm = cpmResult[i];
        st.earliestStart = new Date(now.getTime() + cpm.ES * 24 * 60 * 60 * 1000);
        st.earliestFinish = new Date(now.getTime() + cpm.EF * 24 * 60 * 60 * 1000);
        st.latestStart = new Date(now.getTime() + cpm.LS * 24 * 60 * 60 * 1000);
        st.latestFinish = new Date(now.getTime() + cpm.LF * 24 * 60 * 60 * 1000);
        st.float = cpm.slack;
        st.isCritical = cpm.isCritical;
        return st.save();
    })
    );


    // STEP 5: Prepare and return levelized topological order and CPM data
    // const levelized = levelizedTopologicalSort(indexedSubtasks); relocated for response

    res.status(200).json({
      message: 'Scheduling completed successfully using CPM',
      levelizedOrder: levelized,
      cpmData: cpmResult
    });

  } catch (error) {
    console.error('Scheduling error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


function buildExplanation(levelized, subtasks) {
  const explanationStages = [];

  levelized.forEach((group, idx) => {
    const names = group.map(i => subtasks[i].name || `Subtask ${i + 1}`).join(' and ');
    explanationStages.push(`Stage ${idx + 1}: ${names} ${group.length > 1 ? 'run in parallel' : 'runs'}.`);
  });

  const totalDuration = levelized.reduce((sum, group) => {
    const maxDur = Math.max(...group.map(i => subtasks[i].estimatedDurationDays || 0));
    return sum + maxDur;
  }, 0);

  explanationStages.push(`Total project duration based on critical path is ${totalDuration} days.`);

  return explanationStages;
}
