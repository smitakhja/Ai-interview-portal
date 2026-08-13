import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { aptitudeBank } from "../data/aptitudeQuestions.js"; // Fallback

const router = Router();

async function getAptitudeQuestionsFromDb() {
  try {
    const snapshot = await db.collection("aptitude").get();
    if (!snapshot.empty) {
      return snapshot.docs.map(doc => doc.data());
    }
  } catch (err) {
    console.error("Firestore aptitude error:", err.message);
  }
  return aptitudeBank || [];
}

// GET /api/aptitude/questions?count=8
router.get("/questions", async (req, res) => {
  const { count = 8 } = req.query;
  const pool = await getAptitudeQuestionsFromDb();
  
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Number(count));
  
  const questions = selected.map(({ answer, ...q }) => q);
  res.json({ questions });
});

// POST /api/aptitude/submit  { answers: [{ id, selected }] }
router.post("/submit", async (req, res) => {
  const { answers = [] } = req.body;
  const pool = await getAptitudeQuestionsFromDb();

  let correctCount = 0;
  const byCategory = {};
  const breakdown = answers.map(({ id, selected }) => {
    const q = pool.find((item) => item.id === id || String(item.id) === String(id));
    const isCorrect = q && q.answer === selected;
    if (isCorrect) correctCount += 1;
    if (q) {
      byCategory[q.category] = byCategory[q.category] || { correct: 0, total: 0 };
      byCategory[q.category].total += 1;
      if (isCorrect) byCategory[q.category].correct += 1;
    }
    return { id, correct: !!isCorrect, correctAnswer: q?.answer };
  });

  const score = Math.round((correctCount / Math.max(answers.length, 1)) * 100);
  res.json({ success: true, score, correctCount, total: answers.length, byCategory, breakdown });
});

export default router;
