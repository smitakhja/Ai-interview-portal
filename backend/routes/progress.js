import { Router } from "express";
import { db } from "../firebaseAdmin.js";

const router = Router();

// In-memory store keyed by userId (fallback if Firestore fails).
const store = new Map();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

function getDefault() {
  return {
    resumeAnalyzer: { attempts: 0, bestScore: 0 },
    mockInterview: { attempts: 0, bestScore: 0 },
    technicalQuiz: { attempts: 0, bestScore: 0 },
    aptitudeTest: { attempts: 0, bestScore: 0 },
    hrInterview: { attempts: 0, bestScore: 0 },
    history: [],
  };
}

// GET /api/progress
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  let data = store.get(userId) || getDefault();

  try {
    const doc = await db.collection("progress").doc(userId).get();
    if (doc.exists) {
       const dbProgress = doc.data();
       // Merge Firestore data into default structure
       data = { ...data, ...dbProgress };
    }
  } catch (err) {
    console.error("Firestore Error (progress GET):", err.message);
  }

  const modules = ["resumeAnalyzer", "mockInterview", "technicalQuiz", "aptitudeTest", "hrInterview"];
  const readiness = data.readiness !== undefined ? data.readiness : Math.round(
    modules.reduce((sum, m) => sum + (data[m]?.bestScore || 0), 0) / modules.length
  );
  
  res.json({ ...data, readiness });
});

// POST /api/progress/update  { module, score }
router.post("/update", async (req, res) => {
  const userId = getUserId(req);
  const { module, score } = req.body;
  if (!module || typeof score !== "number") {
    return res.status(400).json({ error: "module and numeric score are required." });
  }

  const data = store.get(userId) || getDefault();
  if (!data[module]) {
    return res.status(400).json({ error: `Unknown module: ${module}` });
  }

  data[module].attempts += 1;
  data[module].bestScore = Math.max(data[module].bestScore, score);
  data.history.unshift({ module, score, date: new Date().toISOString() });
  data.history = data.history.slice(0, 30);

  store.set(userId, data);

  try {
    const newAverage = Object.keys(data)
      .filter(k => k !== 'history' && k !== 'readiness' && data[k].bestScore)
      .reduce((sum, k) => sum + data[k].bestScore, 0) / 5;
      
    data.readiness = Math.round(newAverage);
    
    // Upsert into Firestore
    await db.collection("progress").doc(userId).set(data, { merge: true });
  } catch (err) {
    console.error("Firestore Error (progress POST):", err.message);
  }

  res.json({ success: true, data });
});

export default router;
