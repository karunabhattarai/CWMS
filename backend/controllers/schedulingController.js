import { detectCircularDependency, levelizedTopologicalSort } from '../utils/graphUtils.js';
import { computeCPM } from '../algorithms/cpm.js';
import Task from '../models/Task.js';
import Subtask from '../models/Subtask.js';
import { getSchedulingSuggestion } from '../services/schedulingSuggestionService.js';

import { computePERT } from "../algorithms/pert.js";
import { buildPERTExplanation } from "../utils/pertHelpers.js";

// Helper function to run CPM scheduling without HTTP response
export const runCPMForTask = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  const subtasks = await Subtask.find({ task: task._id }).populate(
    "dependencies"
  );

  if (subtasks.length === 0) return; // No subtasks to schedule

  // Format subtasks for CPM
  const formattedSubtasks = subtasks.map((st) => ({
    _id: st._id.toString(),
    estimatedDurationDays: st.estimatedDurationDays,
    dependencies: st.dependencies.map((d) => d._id.toString()),
  }));

  // Map _id to index for CPM input
  const indexMap = new Map();
  formattedSubtasks.forEach((st, i) => indexMap.set(st._id, i));

  // Build CPM-ready array with indices instead of IDs for dependencies
  const indexedSubtasks = formattedSubtasks.map((st) => ({
    estimatedDurationDays: st.estimatedDurationDays,
    dependencies: st.dependencies.map((depId) => indexMap.get(depId)),
  }));

  // Check circular dependencies
  if (detectCircularDependency(indexedSubtasks)) {
    console.warn("Circular dependency detected among subtasks - skipping CPM");
    return;
  }

  // Run CPM
  const cpmResult = computeCPM(indexedSubtasks);
  const now = task.startDate || new Date();



  // Extract critical path subtasks    -- this added from the scheduleTask to mimic already made functionality
  const criticalPathFull = subtasks.map((st, i) => ({
    _id: st._id,
    name: st.name || `Subtask ${i + 1}`,
    duration: st.estimatedDurationDays,
    float: cpmResult[i].slack,
    isCritical: cpmResult[i].isCritical
  }));

  const levelized = levelizedTopologicalSort(indexedSubtasks);
  const criticalPath = criticalPathFull.filter(st => st.isCritical);

  // Deadline check
  const criticalPathDuration = Math.max(...cpmResult.map(s => s.EF));
  const deadline = new Date(task.deadline);
  const deadlineDuration = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)); // in days

  let suggestion = null;
  let explanation = buildExplanation(levelized, subtasks);

  if (criticalPathDuration > deadlineDuration) {
    suggestion = getSchedulingSuggestion(criticalPathDuration, deadlineDuration, cpmResult);
  }



  // Save CPM results back to subtasks with calculated deadlines
  await Promise.all(
    subtasks.map((st, i) => {
      const cmp = cpmResult[i];
      st.earliestStart = new Date(now.getTime() + cmp.ES * 24 * 60 * 60 * 1000);
      st.earliestFinish = new Date(
        now.getTime() + cmp.EF * 24 * 60 * 60 * 1000
      );
      st.latestStart = new Date(now.getTime() + cmp.LS * 24 * 60 * 60 * 1000);
      st.latestFinish = new Date(now.getTime() + cmp.LF * 24 * 60 * 60 * 1000);
      st.float = cmp.slack;
      st.isCritical = cmp.isCritical;
      return st.save();
    })
  );

  return {
    message: criticalPathDuration > deadlineDuration 
      ? 'Deadline is too short for this task based on CPM'
      : 'Scheduling completed successfully using CPM',
    levelizedOrder: levelized,
    cpmData: cpmResult,
    criticalPath: {
      subtasks: criticalPath,
      totalDuration: criticalPathDuration
    },
    availableDays: deadlineDuration,
    suggestion,
    explanation
  };
};

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

// this makes explanation for the cpm scheduling
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






//for pert

export const scheduleTaskPERT = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const subtasks = await Subtask.find({ task: taskId }).populate('dependencies');

    const formatted = subtasks.map((st, i) => ({
      optimistic: st.optimistic,
      mostLikely: st.mostLikely,
      pessimistic: st.pessimistic,
      dependencies: st.dependencies.map(d => subtasks.findIndex(s => s._id.equals(d._id)))
    }));

    const result = computePERT(formatted);

    res.status(200).json({
      message: 'PERT scheduling completed',
      projectDuration: result.projectDuration,
      totalVariance: result.totalVariance,
      stdDeviation: Math.sqrt(result.totalVariance),
      subtasks: result.subtasks
    });

  } catch (err) {
    console.error('PERT Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const schedulePERTFromRaw = async (req, res) => {
  try {
    const subtasks = req.body;

    // Basic validation (you can extend this)
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      return res.status(400).json({ message: 'Invalid subtasks array in request body' });
    }

    // Run your PERT algorithm on raw input
    const pertResult = computePERT(subtasks);

    // You might want to build some explanation or critical path info here similarly

    res.status(200).json({
      message: 'PERT scheduling completed successfully',
      pertData: pertResult,
    });
  } catch (error) {
    console.error('PERT scheduling error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

//below updted but is throwing error
// export const schedulePERTFromRaw = async (req, res) => {
//   try {
//     const subtasks = req.body;

//     // Basic validation (you can extend this)
//     if (!Array.isArray(subtasks) || subtasks.length === 0) {
//       return res.status(400).json({ message: 'Invalid subtasks array in request body' });
//     }

//     // Run your PERT algorithm on raw input
//     const pertResult = computePERT(subtasks);
//     const formattedSubtasks = subtasks.map((st, idx) => {
//     if (!st || !st._id) {
//         console.error(`Subtask at index ${idx} is missing _id`, st);
//         // handle or skip this subtask, or throw error
//     }
//     return {
//         _id: st._id.toString(),
//         estimatedDurationDays: st.estimatedDurationDays,
//         dependencies: (st.dependencies || []).map(d => d._id.toString()),
//     };
//     });
//     const indexedSubtasks = formattedSubtasks.map(st => ({
//       estimatedDurationDays: st.estimatedDurationDays,
//       dependencies: st.dependencies.map(depId => indexMap.get(depId)),
//     }));
//     // You might want to build some explanation or critical path info here similarly
//     const levelized = levelizedTopologicalSort(indexedSubtasks); // same as CPM, but on PERT data indexes

//     // You might get deadlineDays from the task deadline - current date
//     const now = task.startDate || new Date();
//     const deadline = new Date(task.deadline);
//     const deadlineDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

//     // Build explanation
//     const explanation = buildPERTExplanation(levelized, subtasks, projectDuration, totalVariance, deadlineDays);

//     res.status(200).json({
//     message: 'PERT scheduling completed successfully',
//     pertData: { subtasks: pertResults, projectDuration, totalVariance },
//     topologicalOrder: levelized,
//     explanation
//     });
//   } catch (error) {
//     console.error('PERT scheduling error:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };