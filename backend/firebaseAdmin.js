import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

let _app;
try {
  if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT || (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)) {
      let serviceAccount;
      
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (e) {
          console.error("Invalid JSON in FIREBASE_SERVICE_ACCOUNT");
        }
      } else {
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
      }
      
      if (serviceAccount) {
        _app = initializeApp({ credential: cert(serviceAccount) });
        console.log("🔥 Firebase Admin initialized securely.");
      }
    } else {
      console.warn("⚠️ Firebase Admin credentials missing. Running in unauthenticated stub mode. Database writes will fail on Vercel.");
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
