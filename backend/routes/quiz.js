import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { getQuizSet, quizBank } from "../data/quizQuestions.js"; // Fallback if Firebase not seeded

const router = Router();

// Helper to get questions from Firestore with a fallback to local JSON
async function getQuestionsFromDb(topic) {
  try {
    const doc = await db.collection("quizzes").doc(topic).get();
    if (doc.exists) {
      return doc.data().questions || [];
    }
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
      const topics = snapshot.docs.map(doc => doc.id);
      return res.json({ topics });
    }
  } catch (err) {}
  // Fallback
  res.json({ topics: Object.keys(quizBank) });
});

// GET /api/quiz/questions?topic=javascript&count=5
router.get("/questions", async (req, res) => {
  const { topic = "javascript", count = 5 } = req.query;
  const pool = await getQuestionsFromDb(topic);
  
  // Shuffle and pick
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Number(count));
  
  // Strip answers
  const questions = selected.map(({ answer, explanation, ...q }) => q);
  res.json({ topic, questions });
});

// POST /api/quiz/submit  { topic, answers: [{ id, selected }] }
router.post("/submit", async (req, res) => {
  const { topic = "javascript", answers = [] } = req.body;
  const pool = await getQuestionsFromDb(topic);

  let correctCount = 0;
  const breakdown = answers.map(({ id, selected }) => {
    const q = pool.find((item) => item.id === id);
    const isCorrect = q && q.answer === selected;
    if (isCorrect) correctCount += 1;
    return {
      id,
      correct: !!isCorrect,
      correctAnswer: q?.answer,
      explanation: q?.explanation,
    };
  });

  const score = Math.round((correctCount / Math.max(answers.length, 1)) * 100);
  res.json({ success: true, score, correctCount, total: answers.length, breakdown });
});

export default router;
