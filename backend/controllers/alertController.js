



// i want to have alert for after i run cpm
// this will be run after cpm and will alert task members with 0 slack, that their timelines are rigid and they need to finish it in time, and if they can't please consult with the manager



//you have been assigned a new role "" - alert + notiff jaos




// before this i think i need a raw function that will popup an alert to the user, and also add to the notiffication tray and email them

// i already have sendEmail setup
// i need the popup and notification tray
// if this makes sense



// controllers/alertController.js
import { sendAlert } from "../services/alertService.js";

/**
 * Send a live alert to one or more users
 * This is NOT persisted in DB unless alertService also creates a Notification
 */
export const sendAlertController = async (req, res) => {
  try {
    const { recipients, message, type, redirectTo, persist } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ success: false, error: "Recipients required" });
    }

    // call the service that handles both websocket + optional persistence
    await sendAlert({
      recipients,
      message,
      type: type || "info",
      redirectTo: redirectTo || null,
      persist: persist || false, // if true, also creates a Notification
    });

    res.status(200).json({ success: true, message: "Alert sent successfully" });
  } catch (err) {
    console.error("Error sending alert:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};



