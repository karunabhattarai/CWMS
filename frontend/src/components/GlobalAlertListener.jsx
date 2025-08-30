import { useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { getSocket } from "../utils/websocket";
import { useAlerts } from "../hooks/useAlerts";

export default function GlobalAlertListener() {
  const { user, loading } = useAuth();
  const { showSuccess, showError, showWarning, showInfo, addAlert } = useAlerts();

  useEffect(() => {
    // Don't connect socket until auth is loaded and user is available
    if (loading || !user || !user.id) {
      console.log("[GlobalAlertListener] Waiting for auth/user:", { loading, user: !!user, userId: user?.id });
      return;
    }

    const socket = getSocket();
    console.log("[GlobalAlertListener] Socket instance:", socket);
    
    console.log("[GlobalAlertListener] Emitting join for user:", user.id);
    socket.emit("join", user.id);
    
    socket.on("connect", () => {
      console.log("[GlobalAlertListener] Socket connected:", socket.id);
      // Re-join room on reconnect
      socket.emit("join", user.id);
    });
    
    socket.on("alert", (alert) => {
      console.log("[GlobalAlertListener] Received alert:", alert);
      
      // Add a small delay to ensure the alert displays after any UI state changes
      setTimeout(() => {
        // Handle deadline alerts with redirect functionality
        if (['soft_deadline', 'hard_deadline'].includes(alert.type)) {
          addAlert(alert.type, alert.message, 0, alert.redirectTo);
        } else {
          // Handle regular alerts (truncate message for display)
          const truncatedMsg = alert.message.length > 50 ? alert.message.slice(0, 47) + "..." : alert.message;
          
          switch (alert.type) {
            case "success":
              showSuccess(truncatedMsg);
              break;
            case "error":
              showError(truncatedMsg);
              break;
            case "warning":
              showWarning(truncatedMsg);
              break;
            case "critical":
              showError(truncatedMsg); // Treat critical as error
              break;
            default:
              showInfo(truncatedMsg);
          }
        }
      }, 100); // Small delay to let UI settle
    });
    
    socket.on("disconnect", () => {
      console.log("[GlobalAlertListener] Socket disconnected");
    });

    return () => {
      socket.off("alert");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user, loading, showSuccess, showError, showWarning, showInfo, addAlert]);

  return null;
}
