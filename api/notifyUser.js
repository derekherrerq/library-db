// functions/notifyUser.js (this would be an API route or a serverless function)
import { sendNotification } from './firebase-admin'; // Import the function to send notifications

// Firebase Admin SDK initialization (for serverless)
import * as admin from 'firebase-admin';

// Check if Firebase has already been initialized to avoid reinitialization
if (!admin.apps.length) {
  admin.initializeApp();
}

const messaging = admin.messaging();

const sendDueSoonNotification = async (userId, message) => {
  try {
    // Get the FCM token from your database (for the user with userId)
    const token = await getUserFCMTokenFromDatabase(userId); // Example function to fetch token
    if (token) {
      await sendNotification(token, message); // Send the notification using the token
    } else {
      console.log('No FCM token found for user');
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Example of what this function might look like in a serverless setup
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, message } = req.body;
    await sendDueSoonNotification(userId, message);
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
