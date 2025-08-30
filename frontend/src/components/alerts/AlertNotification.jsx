import React from 'react';
import { useAuth } from '../../context/useAuth';

const AlertNotification = ({ alert, onClose }) => {
  const { token } = useAuth();

  const handleRedirect = () => {
    if (alert.redirectTo) {
      // Close the alert first
      onClose();
      
      // Navigate to the redirect URL
      window.location.href = alert.redirectTo;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'soft_deadline':
        return '⏰';
      case 'hard_deadline':
        return '🚨';
      case 'critical':
        return '🔥';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'soft_deadline':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'hard_deadline':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 shadow-lg mb-4 transition-all duration-300 ${getAlertStyle(alert.type)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">
            {getAlertIcon(alert.type)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {alert.message}
            </p>
            <p className="text-xs opacity-75 mt-1">
              {new Date(alert.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {alert.redirectTo && (
            <button
              onClick={handleRedirect}
              className="text-xs px-3 py-1 bg-white bg-opacity-80 rounded hover:bg-opacity-100 transition-all font-medium"
            >
              {alert.type === 'soft_deadline' ? 'Respond' : 'View'}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded hover:bg-opacity-100 transition-all"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertNotification;
