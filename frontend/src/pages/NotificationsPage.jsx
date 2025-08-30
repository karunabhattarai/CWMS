import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    console.log(
      "NotificationsPage useEffect triggered, user:",
      user,
      "authLoading:",
      authLoading
    );

    // Wait for auth loading to complete
    if (authLoading) {
      console.log("Auth is still loading, waiting...");
      return;
    }

    // If user is null (not authenticated), stop loading
    if (!user) {
      console.log("User is null (not authenticated), setting loading to false");
      setLoading(false);
      return;
    }

    // If user exists but no id, stop loading
    const userId = user.id || user._id;
    if (!userId) {
      console.log("User exists but no id or _id, setting loading to false");
      console.log("User object keys:", Object.keys(user));
      console.log("User object:", user);
      console.log("Checking for user.id:", user.id);
      console.log("Checking for user.userId:", user.userId);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        console.log("Fetching notifications for user:", userId);
        const response = await fetch(`/api/notification/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Notifications data:", data);
          setNotifications(data.data || []);
        } else {
          console.error(
            "Failed to fetch notifications:",
            response.status,
            response.statusText
          );
          // Set empty notifications array on error
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Set empty notifications array on error
        setNotifications([]);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, authLoading]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notification/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId
              ? {
                  ...notif,
                  readBy: [...(notif.readBy || []), user.id || user._id],
                }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notification/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
      } else {
        console.error(
          "Failed to delete notification - insufficient permissions"
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!isRead(notification)) {
      await markAsRead(notification._id);
    }

    // Redirect if there's a redirectTo URL
    if (notification.redirectTo) {
      window.location.href = notification.redirectTo;
    }
  };

  const isRead = (notification) => {
    return notification.readBy?.includes(user.id || user._id);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !isRead(notif);
    if (filter === "read") return isRead(notif);
    return true; // 'all'
  });

  const unreadCount = notifications.filter((notif) => !isRead(notif)).length;

  const markAllAsRead = async () => {
    const unreadNotifications = filteredNotifications.filter(
      (notif) => !notif.readBy?.includes(user.id || user._id)
    );

    for (const notif of unreadNotifications) {
      await markAsRead(notif._id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "warning":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case "critical":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case "deadline":
        return <ClockIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BellIcon className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckIcon className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: "all", label: "All", count: notifications.length },
          { key: "unread", label: "Unread", count: unreadCount },
          {
            key: "read",
            label: "Read",
            count: notifications.length - unreadCount,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications"}
            </h3>
            <p className="text-gray-500">
              {filter === "unread"
                ? "All caught up! Check back later for new updates."
                : "You will see notifications here when you receive them."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                isRead(notification)
                  ? "bg-white border-gray-200 hover:bg-gray-50"
                  : "bg-blue-50 border-blue-200 shadow-sm hover:bg-blue-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      isRead(notification)
                        ? "text-gray-700"
                        : "text-gray-900 font-medium"
                    }`}
                  >
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{formatDate(notification.createdAt)}</span>
                    {notification.type && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{notification.type}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!isRead(notification) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Mark as read"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  )}

                  {(user?.role === "superadmin" ||
                    user?.role === "manager") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete notification"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {notification.redirectTo && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a
                    href={notification.redirectTo}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    View details →
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
