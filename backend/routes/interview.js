import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { getInterviewSet, interviewQuestions } from "../data/interviewQuestions.js";
import { scoreAnswer } from "../utils/analyzer.js";
import { nanoid } from "nanoid";

const router = Router();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

async function getQuestionsFromDb(role) {
  try {
    const doc = await db.collection("interviews").doc(role).get();
    if (doc.exists) return doc.data().questions || [];
  } catch (err) {
    console.error("Firestore interview error:", err.message);
  }
  return interviewQuestions[role] || interviewQuestions["software-engineer"] || [];
}

// GET /api/interview/roles
router.get("/roles", async (_req, res) => {
  try {
    const snapshot = await db.collection("interviews").get();
    if (!snapshot.empty) {
      return res.json({ roles: snapshot.docs.map(doc => doc.id) });
    }
  } catch (err) {}
  res.json({ roles: Object.keys(interviewQuestions) });
});

// GET /api/interview/questions?role=software-engineer&count=5
router.get("/questions", async (req, res) => {
  const { role = "software-engineer", count = 5 } = req.query;
  const pool = await getQuestionsFromDb(role);
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

  // Save to Firestore
  const sessionId = nanoid();
  const session = {
    id: sessionId,
    userId,
    role,
    results,
    averageScore: avg,
    verdict,
    questionsCount: results.length,
    createdAt: new Date().toISOString(),
  };

  try {
    await db
      .collection("users").doc(userId)
      .collection("interviewSessions").doc(sessionId)
      .set(session);
  } catch (err) {
    console.error("Firestore interview save error:", err.message);
  }

  res.json({ success: true, averageScore: avg, verdict, sessionId });
});

// GET /api/interview/history
router.get("/history", async (req, res) => {
  const userId = getUserId(req);
  try {
    const snap = await db
      .collection("users").doc(userId)
      .collection("interviewSessions")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const history = snap.docs.map(d => d.data());
    return res.json({ success: true, history });
  } catch (err) {
    console.error("Firestore interview history error:", err.message);
    res.json({ success: true, history: [] });
  }
});

export default router;
