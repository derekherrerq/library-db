import { useEffect, useState } from 'react';
import { getMessaging, onMessage } from 'firebase/messaging';
import firebaseApp from './firebaseConfig'; // configure Firebase separately

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const messaging = getMessaging(firebaseApp);
    onMessage(messaging, (payload) => {
      setNotifications((prev) => [...prev, payload.notification]);
    });
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.map((notification, index) => (
        <div key={index}>
          <h3>{notification.title}</h3>
          <p>{notification.body}</p>
        </div>
      ))}
    </div>
  );
};

export default Notification;
