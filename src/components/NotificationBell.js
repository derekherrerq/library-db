import React, { useState, useContext } from 'react';
import { FaBell } from 'react-icons/fa';
import { AuthContext } from './Authentication/AuthContext'; // Corrected path

const NotificationBell = ({ notifications = [] }) => {  // Default to an empty array if undefined
    const [showNotifications, setShowNotifications] = useState(false);
    const { logout } = useContext(AuthContext);

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
                onClick={handleBellClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <FaBell style={{ fontSize: '1.8em', color: 'black', marginLeft: '20px' }} />
            </button>
            {showNotifications && (
                <div className="notifications-dropdown">
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <div key={index} className="notification-item">
                                {notification.message}
                            </div>
                        ))
                    ) : (
                        <div className="notification-item">No notifications</div>
                    )}
                </div>
            )}
            <button
                onClick={logout}
                style={{ marginLeft: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
                Logout
            </button>
        </div>
    );
};

export default NotificationBell;
