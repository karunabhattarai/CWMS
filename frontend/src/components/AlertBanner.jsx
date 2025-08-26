import React from "react";
import { useAlerts } from "../hooks/useAlerts";

export default function AlertBanner() {
  const { alerts, removeAlert } = useAlerts();

  if (alerts.length === 0) return null;

  const getAlertColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 shadow-md ${getAlertColor(
            alert.type
          )}`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium">{alert.message}</p>
            <button
              onClick={() => removeAlert(alert.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
