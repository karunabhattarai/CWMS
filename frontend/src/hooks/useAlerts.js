import { useCallback } from "react";
import { useToast } from "../context/ToastContext";

export function useAlerts() {
  const { showToast } = useToast();

  const removeAlert = useCallback(() => {
    // This function is kept for backward compatibility
    // but doesn't do anything since toasts auto-remove themselves
  }, []);

  const showSuccess = useCallback(
    (message) => showToast(message, "success", 4000),
    [showToast]
  );

  const showError = useCallback(
    (message) => showToast(message, "error", 7000),
    [showToast]
  );

  const showWarning = useCallback(
    (message) => showToast(message, "warning", 6000),
    [showToast]
  );

  const showInfo = useCallback(
    (message) => showToast(message, "info", 5000),
    [showToast]
  );

  return {
    // Return empty alerts array for backward compatibility
    alerts: [],
    removeAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
