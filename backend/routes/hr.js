import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { hrQuestions } from "../data/hrQuestions.js"; // Fallback
import { scoreAnswer } from "../utils/analyzer.js";

const router = Router();

async function getHrQuestionsFromDb() {
  try {
    const snapshot = await db.collection("hr").get();
    if (!snapshot.empty) {
      return snapshot.docs.map(doc => doc.data());
    }
  } catch (err) {
    console.error("Firestore hr error:", err.message);
  }
  return hrQuestions || [];
}

// GET /api/hr/questions?count=5
router.get("/questions", async (req, res) => {
  const { count = 5 } = req.query;
  const pool = await getHrQuestionsFromDb();
  
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const questions = shuffled.slice(0, Number(count));
  
  res.json({ questions });
});

// POST /api/hr/answer  { question, keywords, answer }
router.post("/answer", (req, res) => {
  const { question, keywords = [], answer = "" } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "question and answer are required." });
  }
  const result = scoreAnswer(answer, keywords);
  res.json({ success: true, question, ...result });
});

export default router;
