import { useState, useCallback } from "react";

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  const addAlert = useCallback(
    (type, message, duration = 5000, redirectTo = null) => {
      const alert = {
        id: Date.now() + Math.random(),
        type,
        message,
        timestamp: new Date(),
        redirectTo
      };

      setAlerts((prev) => [alert, ...prev.slice(0, 4)]);

      // Don't auto-remove deadline alerts, let user interact
      if (duration > 0 && !['soft_deadline', 'hard_deadline'].includes(type)) {
        setTimeout(() => {
          removeAlert(alert.id);
        }, duration);
      }

      return alert.id;
    },
    [removeAlert]
  );

  const showSuccess = useCallback(
    (message) => addAlert("success", message, 4000),
    [addAlert]
  );

  const showError = useCallback(
    (message) => addAlert("error", message, 7000),
    [addAlert]
  );

  const showWarning = useCallback(
    (message) => addAlert("warning", message, 6000),
    [addAlert]
  );

  const showInfo = useCallback(
    (message) => addAlert("info", message, 5000),
    [addAlert]
  );

  const showDeadlineAlert = useCallback(
    (type, message, redirectTo) => addAlert(type, message, 0, redirectTo),
    [addAlert]
  );

  return {
    alerts,
    removeAlert,
    addAlert, // Export for direct use with WebSocket alerts
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDeadlineAlert,
  };
}
