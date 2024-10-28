const functions = require('firebase-functions');
const admin = require('firebase-admin');
const mysql = require('mysql2/promise');
const dayjs = require('dayjs');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const dbConfig = {
  host: functions.config().db.host,
  user: functions.config().db.user,
  password: functions.config().db.password,
  database: functions.config().db.name,
};

// Initialize FCM
const messaging = admin.messaging();

// Helper function to send FCM notification
async function sendNotification(token, title, body) {
  const message = {
    notification: { title, body },
    token,
  };
  
  try {
    await messaging.send(message);
    console.log("Notification sent successfully:", message);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}