// api/notifications.js
import { Pool } from 'pg';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} else {
  admin.app(); // Use the default app if it's already initialized
}

// Initialize PostgreSQL connection (using environment variables)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 28084,
});

export default async function handler(req, res) {
  try {
    // Fetch overdue/ready holds from the database
    const { rows: notifications } = await pool.query(
      "SELECT * FROM holdrequest WHERE holdstatus = '0' OR (holdstatus = 'overdue' AND CURRENT_DATE > holdexpdate)"
    );

    // Loop through each notification and send it to the user
    for (const notification of notifications) {
      const userId = notification.user_id; // Get user ID from the hold record
      const message = getNotificationMessage(notification);
      
      // Fetch user's FCM token (you may need a separate table for user tokens)
      const fcmToken = await getFCMToken(userId);

      if (fcmToken) {
        // Send notification using Firebase Cloud Messaging
        await admin.messaging().sendToDevice(fcmToken, {
          notification: {
            title: 'Library Notification',
            body: message,
          },
        });
      }
    }

    // Return success response
    res.status(200).json({ message: 'Notifications sent successfully.' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: error.message });
  }
}

// Helper function to generate message content based on hold status
function getNotificationMessage(notification) {
  if (notification.holdstatus === 'ready') {
    return `Your item, "${notification.item_name}", is ready for pickup!`;
  } else if (notification.holdstatus === 'overdue') {
    return `Your item, "${notification.item_name}", is overdue! Please return it ASAP.`;
  }
  return '';
}

// Simulate fetching FCM token from database (you need to implement this query)
async function getFCMToken(userId) {
  // Query the database to get the user's FCM token (this assumes a token is stored for each user)
  const { rows } = await pool.query('SELECT fcm_token FROM users WHERE id = $1', [userId]);
  return rows.length > 0 ? rows[0].fcm_token : null;
}
