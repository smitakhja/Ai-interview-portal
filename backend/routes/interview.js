import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { getInterviewSet, interviewQuestions } from "../data/interviewQuestions.js"; // Fallback
import { scoreAnswer } from "../utils/analyzer.js";

const router = Router();

async function getQuestionsFromDb(role) {
  try {
    const doc = await db.collection("interviews").doc(role).get();
    if (doc.exists) {
      return doc.data().questions || [];
    }
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
      const roles = snapshot.docs.map(doc => doc.id);
      return res.json({ roles });
    }
  } catch (err) {}
  // Fallback
  res.json({ roles: Object.keys(interviewQuestions) });
});

// GET /api/interview/questions?role=software-engineer&count=5
router.get("/questions", async (req, res) => {
  const { role = "software-engineer", count = 5 } = req.query;
  const pool = await getQuestionsFromDb(role);
  
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const questions = shuffled.slice(0, Number(count));
  
  res.json({ role, questions });
});

// POST /api/interview/answer  { questionId, question, keywords, answer }
router.post("/answer", (req, res) => {
  const { question, keywords = [], answer = "" } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "question and answer are required." });
  }
  const result = scoreAnswer(answer, keywords);
  res.json({ success: true, question, ...result });
});

// POST /api/interview/finish  { results: [{score,...}] }
router.post("/finish", (req, res) => {
  const { results = [] } = req.body;
  const avg = results.length
    ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
    : 0;
  res.json({
    success: true,
    averageScore: avg,
    verdict:
      avg >= 80 ? "Interview ready!" : avg >= 55 ? "Good progress, keep practicing." : "Needs more preparation.",
  });
});

export default router;
