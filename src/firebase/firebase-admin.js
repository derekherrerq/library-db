// firebase-admin.js (backend)
import * as admin from 'firebase-admin';

// Initialize Firebase Admin with environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const messaging = admin.messaging();

// Function to send notifications
export const sendNotification = async (token, message) => {
  try {
    const response = await messaging.sendToDevice(token, {
      notification: {
        title: message.title,
        body: message.body,
      },
    });
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.log('Error sending notification:', error);
  }
};

export default messaging;
