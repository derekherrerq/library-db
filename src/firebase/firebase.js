import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyDBFYK1s9Fj7zon-1yQ02a9WdKn_ITU9dI",
    authDomain: "pushnotifications-bdcd1.firebaseapp.com",
    projectId: "pushnotifications-bdcd1",
    storageBucket: "pushnotifications-bdcd1.firebasestorage.app",
    messagingSenderId: "25098732849",
    appId: "1:25098732849:web:5f4aa58a276ade17699c10",
    measurementId: "G-XJKZ0WED7B"
  };

  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  
  export { messaging };