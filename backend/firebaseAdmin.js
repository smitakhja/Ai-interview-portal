import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

let _app;
try {
  if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // If user pasted raw JSON
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (e) {
        console.error("Invalid JSON in FIREBASE_SERVICE_ACCOUNT");
      }
      
      if (serviceAccount) {
        _app = initializeApp({ credential: cert(serviceAccount) });
        console.log("🔥 Firebase Admin initialized securely.");
      }
    } else {
      console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT missing. Firebase Admin is running in unauthenticated stub mode. Database writes will fail on Vercel.");
      _app = initializeApp();
    }
  } else {
    _app = getApps()[0];
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

export const db = _app ? getFirestore(_app) : null;
export const auth = _app ? getAuth(_app) : null;
