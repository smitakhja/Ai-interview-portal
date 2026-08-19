import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { interviewQuestions } from "../data/interviewQuestions.js";
import { scoreAnswer } from "../utils/analyzer.js";
import { nanoid } from "nanoid";

const router = Router();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

// GET /api/interview/roles
router.get("/roles", (_req, res) => {
  res.json({ roles: Object.keys(interviewQuestions) });
});

// GET /api/interview/questions?role=software-engineer&count=5
router.get("/questions", (req, res) => {
  const { role = "software-engineer", count = 5 } = req.query;
  const pool = interviewQuestions[role] || interviewQuestions["software-engineer"] || [];
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  res.json({ role, questions: shuffled.slice(0, Number(count)) });
});

// POST /api/interview/answer  { question, keywords, answer }
router.post("/answer", (req, res) => {
  const { question, keywords = [], answer = "" } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "question and answer are required." });
  }
  const result = scoreAnswer(answer, keywords);
  res.json({ success: true, question, ...result });
});

// POST /api/interview/finish  { role, results: [{score,...}] }
router.post("/finish", async (req, res) => {
  const userId = getUserId(req);
  const { results = [], role = "general" } = req.body;
  const avg = results.length
    ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
    : 0;

  const verdict =
    avg >= 80 ? "Interview ready!" :
    avg >= 55 ? "Good progress, keep practicing." :
    "Needs more preparation.";

  const sessionId = nanoid();

  try {
    if (supabase) {
      await supabase.from("interview_sessions").insert({
        id: sessionId,
        user_id: userId,
        role,
        results,
        average_score: avg,
        verdict,
        questions_count: results.length,
      });
    }
  } catch (err) {
    console.error("Supabase interview save error:", err.message);
  }

  res.json({ success: true, averageScore: avg, verdict, sessionId });
});

// GET /api/interview/history
router.get("/history", async (req, res) => {
  const userId = getUserId(req);
  try {
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const history = (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      role: d.role,
      results: d.results,
      averageScore: d.average_score,
      verdict: d.verdict,
      questionsCount: d.questions_count,
      createdAt: d.created_at,
    }));

    return res.json({ success: true, history });
  } catch (err) {
    console.error("Supabase interview history error:", err.message);
    res.json({ success: true, history: [] });
  }
});

export default router;
