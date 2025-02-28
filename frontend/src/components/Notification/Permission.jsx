import { getMessaging, getToken } from "firebase/messaging";
import firebaseApp from "./firebase"; // Firebase config

const messaging = getMessaging(firebaseApp);

const requestPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_PUBLIC_VAPID_KEY",
    });
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
  }
};

requestPermission();
