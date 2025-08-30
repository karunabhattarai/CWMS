import React from "react";
import { useAlerts } from "../hooks/useAlerts";
import { useNavigate } from "react-router-dom";

export default function AlertBanner() {
  const { alerts, removeAlert } = useAlerts();
  const navigate = useNavigate();

  if (alerts.length === 0) return null;

  const handleRedirect = (alert) => {
    if (alert.redirectTo) {
      removeAlert(alert.id);
      navigate(alert.redirectTo);
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "soft_deadline":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "hard_deadline":
        return "bg-red-50 border-red-200 text-red-800";
      case "critical":
        return "bg-red-100 border-red-300 text-red-900";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "soft_deadline":
        return "⏰";
      case "hard_deadline":
        return "🚨";
      case "critical":
        return "🔥";
      default:
        return "ℹ️";
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
            <div className="flex items-start space-x-2 flex-1">
              <span className="text-lg">{getAlertIcon(alert.type)}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.message}</p>
                {alert.timestamp && (
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              {alert.redirectTo && (
                <button
                  onClick={() => handleRedirect(alert)}
                  className="text-xs px-2 py-1 bg-white bg-opacity-80 rounded hover:bg-opacity-100 transition-all font-medium"
                >
                  {alert.type === 'soft_deadline' ? 'Respond' : 'View'}
                </button>
              )}
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
