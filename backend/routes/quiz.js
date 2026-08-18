import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { quizBank } from "../data/quizQuestions.js";
import { nanoid } from "nanoid";

const router = Router();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

async function getQuestionsFromDb(topic) {
  try {
    const doc = await db.collection("quizzes").doc(topic).get();
    if (doc.exists) return doc.data().questions || [];
  } catch (err) {
    console.error("Firestore quiz error:", err.message);
  }
  return quizBank[topic] || quizBank.javascript || [];
}

// GET /api/quiz/topics
router.get("/topics", async (_req, res) => {
  try {
    const snapshot = await db.collection("quizzes").get();
    if (!snapshot.empty) {
      return res.json({ topics: snapshot.docs.map(doc => doc.id) });
    }
  } catch (err) {}
  res.json({ topics: Object.keys(quizBank) });
});

// GET /api/quiz/questions?topic=javascript&count=5
router.get("/questions", async (req, res) => {
  const { topic = "javascript", count = 5 } = req.query;
  const pool = await getQuestionsFromDb(topic);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Number(count));
  // Strip answers for client
  const questions = selected.map(({ answer, explanation, ...q }) => q);
  res.json({ topic, questions });
});

// POST /api/quiz/submit  { topic, answers: [{ id, selected }] }
router.post("/submit", async (req, res) => {
  const userId = getUserId(req);
  const { topic = "javascript", answers = [] } = req.body;
  const pool = await getQuestionsFromDb(topic);

  let correctCount = 0;
  const breakdown = answers.map(({ id, selected }) => {
    const q = pool.find(item => item.id === id);
    const isCorrect = q && q.answer === selected;
    if (isCorrect) correctCount++;
    return { id, correct: !!isCorrect, correctAnswer: q?.answer, explanation: q?.explanation };
  });

  const score = Math.round((correctCount / Math.max(answers.length, 1)) * 100);

  // Save to Firestore
  const resultId = nanoid();
  const result = {
    id: resultId,
    userId,
    topic,
    score,
    correctCount,
    total: answers.length,
    breakdown,
    createdAt: new Date().toISOString(),
  };

  try {
    await db
      .collection("users").doc(userId)
      .collection("quizResults").doc(resultId)
      .set(result);
  } catch (err) {
    console.error("Firestore quiz save error:", err.message);
  }

  res.json({ success: true, score, correctCount, total: answers.length, breakdown, resultId });
});

// GET /api/quiz/history
router.get("/history", async (req, res) => {
  const userId = getUserId(req);
  try {
    const snap = await db
      .collection("users").doc(userId)
      .collection("quizResults")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    return res.json({ success: true, history: snap.docs.map(d => d.data()) });
  } catch (err) {
    console.error("Firestore quiz history error:", err.message);
    res.json({ success: true, history: [] });
  }
});

export default router;
