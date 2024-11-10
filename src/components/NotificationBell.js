// src/components/NotificationBell.js
import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Call the Vercel serverless function to get notifications
    fetch('/api/notifications')
      .then((response) => response.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.length);
        }
      })
      .catch((error) => console.error('Error fetching notifications:', error));
  }, []);

  return (
    <div className="notification-bell">
      <FaBell />
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      <div className="notification-dropdown">
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notification, index) => (
              <li key={index}>{notification.body}</li>
            ))}
          </ul>
        ) : (
          <p>No notifications</p>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
