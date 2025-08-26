import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipients: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  ], // who gets this notification

  message: { type: String, required: true }, // notification text

  redirectTo: { type: String, required: false }, 
  // e.g. "/dashboard", "/roles", `/tasks/${taskId}`

  type: { 
    type: String, 
    enum: ["info", "warning", "critical", "role", "deadline", "system"], 
    default: "info" 
  }, // categorize notifications

  readBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ], // who has marked it read

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
