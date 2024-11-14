import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import './NotificationBell.css'; // Add this for styling if needed

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        console.log('Fetched notifications:', response.data.notifications); // Debugging log
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60000); // Poll every minute

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
      <FontAwesomeIcon icon={faBell} className="bell-icon" />
      {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications.map((notif, index) => (
              <div key={index} className="notification-item">
                <h5>{notif.title}</h5>
                <p>{notif.body}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
