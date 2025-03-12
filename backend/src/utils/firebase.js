import admin from "firebase-admin";
import fs from 'fs'
// const serviceAccount = JSON.parse(
//   fs.readFileSync(new URL("../../firebase-service-account.json", import.meta.url))
// );
// // Path to Firebase JSON

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

export const sendNotification = async (fcmToken, title, body) => {
  if (!fcmToken) return;
  const message = {
    notification: { title, body },
    token: fcmToken,
  };

  try {
    await admin.messaging().send(message);
    console.log("Notification sent successfully!");
  } catch (error) {
    console.error("FCM Error:", error);
  }
};
