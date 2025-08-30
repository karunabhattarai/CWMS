import { useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { getSocket } from "../utils/websocket";
import { useToast } from "../context/ToastContext";

export default function GlobalAlertListener() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    // Don't connect socket until auth is loaded and user is available
    if (loading || !user || !user.id) {
      return;
    }

    const socket = getSocket();
    socket.emit("join", user.id);

    socket.on("connect", () => {
      // Re-join room on reconnect
      socket.emit("join", user.id);
    });

    socket.on("alert", (alert) => {
      const truncatedMsg =
        alert.message.length > 50
          ? alert.message.slice(0, 47) + "..."
          : alert.message;

      // Add a small delay to ensure the toast displays after any UI state changes
      setTimeout(() => {
        // Map alert types to toast types and set appropriate durations
        let toastType = alert.type;
        let duration = 5000;

        switch (alert.type) {
          case "success":
            toastType = "success";
            duration = 4000;
            break;
          case "error":
          case "critical":
            toastType = "error";
            duration = 7000;
            break;
          case "warning":
            toastType = "warning";
            duration = 6000;
            break;
          default:
            toastType = "info";
            duration = 5000;
        }

        // Show the alert message as toast
        showToast(truncatedMsg, toastType, duration);
      }, 100); // Small delay to let UI settle
    });

    socket.on("disconnect", () => {
      // Socket disconnected
    });

    return () => {
      socket.off("alert");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user, loading, showToast]);

  return null;
}
