// services/alertService.js
import { io } from "../utils/websocket.js"; // socket.io setup
import Notification from "../models/Notification.js";

/**
 * Sends a live alert (and optionally saves as persistent notification)
 */
export const sendAlert = async ({ recipients, message, type, redirectTo, persist }) => {
  try {
    // 1. Real-time via WebSocket
    recipients.forEach(userId => {
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
        recipients,
        message,
        type,
        redirectTo,
      });
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
  const message = `You have been assigned to task: "${task.title}"`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({ recipients: assignedUsers, message, type: "info", redirectTo });
};

// 2. Deadline Updates
export const deadlineUpdateAlert = async (task, affectedUsers) => {
  const message = `Deadline updated for task "${task.title}". Complete it by ${task.dueDate.toDateString()}`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({ recipients: affectedUsers, message, type: "deadline", redirectTo });
};

// 3. Slack Warning (0 slack)
export const slackWarningAlert = async (task, members) => {
  const message = `Your timeline for task "${task.title}" is rigid (0 slack). Please finish on time or consult your manager.`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({ recipients: members, message, type: "warning", redirectTo });
};

// 4. Task Status Change
export const taskStatusAlert = async (task, affectedUsers, status) => {
  const message = `Task "${task.title}" status changed to "${status}"`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({ recipients: affectedUsers, message, type: "info", redirectTo });
};

// 5. Manager Feedback
export const managerFeedbackAlert = async (task, comment, recipients) => {
  const message = `Manager feedback on "${task.title}": ${comment}`;
  const redirectTo = `/tasks/${task._id}`;
  await sendAlert({ recipients, message, type: "info", redirectTo });
};

// 6. System Event
export const systemEventAlert = async (message, recipients, redirectTo = null) => {
  await sendAlert({ recipients, message, type: "system", redirectTo });
};