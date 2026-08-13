import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// TODO: Replace this with your actual service account credentials JSON string
// You can get this from Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
// Save the JSON string into an environment variable named FIREBASE_SERVICE_ACCOUNT
try {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized securely.");
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT is missing. Firebase Admin is running in unauthenticated stub mode.");
      // Initialize without credentials (will fail if accessing protected resources)
      admin.initializeApp();
    }
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

export const db = admin.firestore();
export const auth = admin.auth();
