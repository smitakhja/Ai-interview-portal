import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();
const store = new Map();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

const MODULE_MAP = {
  resumeAnalyzer: "resume_analyzer",
  mockInterview: "mock_interview",
  technicalQuiz: "technical_quiz",
  aptitudeTest: "aptitude_test",
  hrInterview: "hr_interview",
};

const MODULES = ["resumeAnalyzer", "mockInterview", "technicalQuiz", "aptitudeTest", "hrInterview"];

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
    if (supabase) {
      const { data: row, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (row && !error) {
        data = {
          resumeAnalyzer: row.resume_analyzer || { attempts: 0, bestScore: 0 },
          mockInterview: row.mock_interview || { attempts: 0, bestScore: 0 },
          technicalQuiz: row.technical_quiz || { attempts: 0, bestScore: 0 },
          aptitudeTest: row.aptitude_test || { attempts: 0, bestScore: 0 },
          hrInterview: row.hr_interview || { attempts: 0, bestScore: 0 },
          history: row.history || [],
          readiness: row.readiness || 0,
        };
      }
    }
  } catch (err) {
    console.error("Supabase Error (progress GET):", err.message);
  }

  const readiness = data.readiness !== undefined ? data.readiness : Math.round(
    MODULES.reduce((sum, m) => sum + (data[m]?.bestScore || 0), 0) / MODULES.length
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
    if (supabase) {
      const newAverage = Object.keys(data)
        .filter(k => k !== "history" && k !== "readiness" && data[k]?.bestScore)
        .reduce((sum, k) => sum + data[k].bestScore, 0) / 5;

      data.readiness = Math.round(newAverage);
      const dbCol = MODULE_MAP[module];

      const row = {
        user_id: userId,
        [dbCol]: data[module],
        history: data.history,
        readiness: data.readiness,
        updated_at: new Date().toISOString(),
      };

      await supabase.from("progress").upsert(row, { onConflict: "user_id" });
    }
  } catch (err) {
    console.error("Supabase Error (progress POST):", err.message);
  }

  res.json({ success: true, data });
});

export default router;
