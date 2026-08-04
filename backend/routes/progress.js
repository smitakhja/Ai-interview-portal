import { Router } from "express";
import pool from "../db.js";

const router = Router();

// In-memory store keyed by userId (swap for a real DB in production).
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
    // Demo: Try to fetch average_score from MySQL to show it's connected
    const [rows] = await pool.query("SELECT * FROM progress_tracking WHERE user_id = 1");
    if (rows.length > 0) {
       // Just an example of enriching the default data with MySQL data
       // In a real app we'd map all SQL columns to the response
       const dbProgress = rows[0];
       data.readiness = Math.round(dbProgress.average_score || 0);
    }
  } catch (err) {
    console.error("DB Error (progress GET):", err.message);
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
    // Demo: Upsert into MySQL
    const newAverage = Object.keys(data)
      .filter(k => k !== 'history' && data[k].bestScore)
      .reduce((sum, k) => sum + data[k].bestScore, 0) / 5;
      
    await pool.query(
      "INSERT INTO progress_tracking (user_id, average_score) VALUES (1, ?) ON DUPLICATE KEY UPDATE average_score = ?",
      [newAverage, newAverage]
    );
  } catch (err) {
    console.error("DB Error (progress PUT):", err.message);
  }

  res.json({ success: true, data });
});

export default router;
