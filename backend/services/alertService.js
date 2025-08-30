// services/alertService.js
import { getIO } from "../utils/websocket.js"; // socket.io setup
import Notification from "../models/Notification.js";
import Subtask from "../models/Subtask.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
/**
 * Sends a live alert (and optionally saves as persistent notification)
 */
export const sendAlert = async ({
  recipients,
  message,
  type,
  redirectTo,
  persist,
}) => {
  try {
    console.log("inside sendAlert");
    const io = getIO();
    // Ensure recipients is always an array
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];

    console.log("sendAlert recipients:", recipientList);

    // 1. Real-time via WebSocket
    recipientList.forEach((userId) => {
      console.log("Sending alert to user:", userId, userId?.toString());
      io.to(userId.toString()).emit("alert", {
        message,
        type,
        redirectTo: redirectTo || null,
        createdAt: new Date(),
      });
    });

    // 2. If persistent, create a Notification too
    if (persist) {
      const notif = new Notification({
        recipients: recipientList,
        message,
        type,
        redirectTo,
      });
      console.log("Notification to be saved:", notif);
      await notif.save();
    }
  } catch (err) {
    console.error("Error in sendAlert:", err);
    throw err;
  }
};

// specific alert types

//1 Task Assignment
// when a manager assigns a task to the person
export const taskAssignmentAlert = async (task, assignedUsers) => {
  console.log("taskAssignmentAlert called with task:", task._id, task.name);
  console.log("assignedUsers:", assignedUsers);

  const message = `You have been assigned to task: "${task.name}"`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({
    recipients: assignedUsers,
    message,
    type: "info",
    redirectTo,
    persist: true,
  });
};

// basically when task is creaated
export const taskCreationAlert = async (task) => {
  try {
    // Fetch the full task document to ensure name is available
    const fullTask = await Task.findById(task._id);
    console.log(
      "[taskCreationAlert] Called for task:",
      fullTask._id,
      fullTask.name
    );
    // Fetch all subtasks for this task
    const subtasks = await Subtask.find({ task: fullTask._id }).populate(
      "assignedMember"
    );
    console.log("[taskCreationAlert] Subtasks found:", subtasks.length);
    const User = (await import("../models/User.js")).default;
    for (const subtask of subtasks) {
      console.log(
        "[taskCreationAlert] Processing subtask:",
        subtask._id,
        subtask.name
      );
      if (!subtask.assignedMember) {
        console.log(
          "[taskCreationAlert] Skipping subtask, no assigned member:",
          subtask._id
        );
        continue;
      }
      // Find the user whose member field matches assignedMember._id
      const user = await User.findOne({ member: subtask.assignedMember._id });
      if (!user) {
        console.log(
          "[taskCreationAlert] Skipping subtask, no user for member:",
          subtask.assignedMember._id
        );
        continue;
      }
      const recipientId = user._id;
      console.log(
        "[taskCreationAlert] Sending alert to recipient (userId):",
        recipientId
      );
      const message =
        `You are assigned to subtask: "${subtask.name}" of project "${fullTask.name}"` +
        (subtask.isCritical
          ? " ⚠️ This task is CRITICAL! Any delay will delay the project."
          : "");
      const type = subtask.isCritical ? "critical" : "info";
      const redirectTo = `/tasks/${fullTask._id}`;
      await sendAlert({
        recipients: [recipientId],
        message,
        type,
        redirectTo,
        persist: true,
      });
    }
    console.log("[taskCreationAlert] Finished processing all subtasks.");
  } catch (err) {
    console.error("[taskCreationAlert] Error:", err);
    throw err;
  }
};

// 2. Deadline Updates
export const deadlineUpdateAlert = async (task, affectedUsers) => {
  // affectedUsers should be array of user IDs
  const deadline = task.deadline || task.dueDate; // Handle both field names
  const deadlineStr = deadline ? new Date(deadline).toDateString() : "TBD";
  const message = `Deadline updated for task "${task.name}". Complete it by ${deadlineStr}`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({
    recipients: affectedUsers,
    message,
    type: "deadline",
    redirectTo,
  });
};

// 3. Slack Warning (0 slack)
export const slackWarningAlert = async (task, members) => {
  // members should be array of user IDs
  const message = `Your timeline for task "${task.name}" is rigid (0 slack). Please finish on time or consult your manager.`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({
    recipients: members,
    message,
    type: "warning",
    redirectTo,
  });
};

// 4. Task Status Change
export const taskStatusAlert = async (task, affectedUsers, status) => {
  // affectedUsers should be array of user IDs
  const message = `Task "${task.name}" status changed to "${status}"`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({
    recipients: affectedUsers,
    message,
    type: "info",
    redirectTo,
  });
};

// 5. Manager Feedback
export const managerFeedbackAlert = async (task, comment, recipients) => {
  // recipients should be array of user IDs
  const message = `Manager feedback on "${task.name}": ${comment}`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({ recipients, message, type: "info", redirectTo });
};

// 6. System Event
export const systemEventAlert = async (
  message,
  recipients,
  redirectTo = null
) => {
  await sendAlert({ recipients, message, type: "system", redirectTo });
};

// CPM run hune bittikai critical tasks ra citical members are to be notified first
export const criticalPathAlert = async (criticalTasks) => {
  const recipients = [];

  // Collect user IDs from assignedMember and assignedResponsibleMember
  const User = (await import("../models/User.js")).default;
  for (const task of criticalTasks) {
    if (task.assignedMember) {
      const user = await User.findOne({ member: task.assignedMember._id });
      if (user) recipients.push(user._id);
    }
    if (task.assignedResponsibleMember) {
      const user = await User.findOne({
        member: task.assignedResponsibleMember._id,
      });
      if (user) recipients.push(user._id);
    }
  }

  const uniqueRecipients = [...new Set(recipients.map((r) => r.toString()))];

  const message = `Critical Path identified: ${criticalTasks.length} critical tasks assigned to you. These have zero slack, finish on time.`;
  // Notify realtime + save
  await sendAlert({
    recipients: uniqueRecipients,
    message,
    type: "critical",
    redirectTo: "/dashboard/critical-path",
    persist: true, // save in DB too
  });
};

// New deadline-specific alerts
export const softDeadlineAlert = async (subtask, task) => {
  try {
    if (!subtask.assignedMember) return;

    const User = (await import("../models/User.js")).default;
    const user = await User.findOne({ member: subtask.assignedMember._id });
    if (!user) return;

    const message = `⚠️ Soft deadline reminder: Will you be able to complete "${subtask.name}" (from project "${task.name}") by tomorrow? Please confirm your status.`;

    await sendAlert({
      recipients: [user._id],
      message,
      type: "soft_deadline",
      redirectTo: `/subtasks/${subtask._id}?action=confirm_completion`,
      persist: true,
    });
  } catch (error) {
    console.error("Error in softDeadlineAlert:", error);
  }
};

export const hardDeadlineAlert = async (subtask, task) => {
  try {
    if (!subtask.assignedMember) return;

    const User = (await import("../models/User.js")).default;
    const user = await User.findOne({ member: subtask.assignedMember._id });
    if (!user) return;

    const message = `🚨 DEADLINE TODAY: "${subtask.name}" (from project "${task.name}") is due today! Please submit your work immediately.`;

    await sendAlert({
      recipients: [user._id],
      message,
      type: "hard_deadline",
      redirectTo: `/subtasks/${subtask._id}?action=submit_work`,
      persist: true,
    });
  } catch (error) {
    console.error("Error in hardDeadlineAlert:", error);
  }
};

export const managerEscalationAlert = async (subtask, task, assignedUser) => {
  try {
    // Find managers in the same company
    const User = (await import("../models/User.js")).default;
    const managers = await User.find({
      company: task.company,
      role: "manager",
    });

    if (managers.length === 0) return;

    const managerIds = managers.map((m) => m._id);
    const userName = assignedUser.name || "Unknown User";

    const message = `⚠️ ESCALATION: User "${userName}" indicated they cannot complete "${subtask.name}" (from project "${task.name}") on time. Please consult with them immediately.`;

    await sendAlert({
      recipients: managerIds,
      message,
      type: "escalation",
      redirectTo: `/tasks/${task._id}?focus=subtask_${subtask._id}`,
      persist: true,
    });
  } catch (error) {
    console.error("Error in managerEscalationAlert:", error);
  }
};
