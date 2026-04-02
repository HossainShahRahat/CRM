"use client";

import { useEffect, useState, useTransition } from "react";

import {
  fetchNotifications,
  markNotificationAsRead,
  type NotificationRecord,
} from "../../lib/notifications";

export const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadNotifications = () => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await fetchNotifications();
        setNotifications(result.data);
        setUnreadCount(result.unreadCount);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load notifications.",
        );
      }
    });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleOpen = () => {
    setOpen((current) => !current);
    if (!open) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    startTransition(async () => {
      try {
        const updated = await markNotificationAsRead(notificationId);
        setNotifications((current) =>
          current.map((item) => (item.id === notificationId ? updated : item)),
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch (markError) {
        setError(
          markError instanceof Error
            ? markError.message
            : "Failed to update notification.",
        );
      }
    });
  };

  return (
    <div className="notification-dropdown">
      <button type="button" className="notification-trigger" onClick={handleOpen}>
        Notifications
        {unreadCount > 0 ? <span className="notification-badge">{unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="notification-panel">
          <div className="notification-panel__header">
            <strong>In-app notifications</strong>
            <span>{isPending ? "Refreshing..." : `${unreadCount} unread`}</span>
          </div>

          {error ? <p className="status-message status-message--error">{error}</p> : null}

          <div className="notification-list">
            {notifications.length ? (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`notification-item ${
                    notification.isRead ? "notification-item--read" : ""
                  }`}
                >
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                  </div>
                  {!notification.isRead ? (
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark read
                    </button>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="contacts-table__subtext">No notifications yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

