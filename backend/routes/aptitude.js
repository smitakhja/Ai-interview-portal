import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { aptitudeBank } from "../data/aptitudeQuestions.js";
import { nanoid } from "nanoid";

const router = Router();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

async function getAptitudeQuestionsFromDb() {
  try {
    const snapshot = await db.collection("aptitude").get();
    if (!snapshot.empty) return snapshot.docs.map(doc => doc.data());
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
  const questions = shuffled.slice(0, Number(count)).map(({ answer, ...q }) => q);
  res.json({ questions });
});

// POST /api/aptitude/submit  { answers: [{ id, selected }] }
router.post("/submit", async (req, res) => {
  const userId = getUserId(req);
  const { answers = [] } = req.body;
  const pool = await getAptitudeQuestionsFromDb();

  let correctCount = 0;
  const byCategory = {};
  const breakdown = answers.map(({ id, selected }) => {
    const q = pool.find(item => item.id === id || String(item.id) === String(id));
    const isCorrect = q && q.answer === selected;
    if (isCorrect) correctCount++;
    if (q) {
      byCategory[q.category] = byCategory[q.category] || { correct: 0, total: 0 };
      byCategory[q.category].total++;
      if (isCorrect) byCategory[q.category].correct++;
    }
    return { id, correct: !!isCorrect, correctAnswer: q?.answer };
  });

  const score = Math.round((correctCount / Math.max(answers.length, 1)) * 100);

  // Save to Firestore
  const resultId = nanoid();
  const result = {
    id: resultId,
    userId,
    score,
    correctCount,
    total: answers.length,
    byCategory,
    breakdown,
    createdAt: new Date().toISOString(),
  };

  try {
    await db
      .collection("users").doc(userId)
      .collection("aptitudeResults").doc(resultId)
      .set(result);
  } catch (err) {
    console.error("Firestore aptitude save error:", err.message);
  }

  res.json({ success: true, score, correctCount, total: answers.length, byCategory, breakdown, resultId });
});

// GET /api/aptitude/history
router.get("/history", async (req, res) => {
  const userId = getUserId(req);
  try {
    const snap = await db
      .collection("users").doc(userId)
      .collection("aptitudeResults")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    return res.json({ success: true, history: snap.docs.map(d => d.data()) });
  } catch (err) {
    console.error("Firestore aptitude history error:", err.message);
    res.json({ success: true, history: [] });
  }
});

export default router;
