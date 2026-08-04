import { Router } from "express";
import { getQuizSet, quizBank } from "../data/quizQuestions.js";

const router = Router();

// GET /api/quiz/topics
router.get("/topics", (_req, res) => {
  res.json({ topics: Object.keys(quizBank) });
});

// GET /api/quiz/questions?topic=javascript&count=5
router.get("/questions", (req, res) => {
  const { topic = "javascript", count = 5 } = req.query;
  const questions = getQuizSet(topic, Number(count)).map(({ answer, explanation, ...q }) => q);
  res.json({ topic, questions });
});

// POST /api/quiz/submit  { topic, answers: [{ id, selected }] }
router.post("/submit", (req, res) => {
  const { topic = "javascript", answers = [] } = req.body;
  const pool = quizBank[topic] || quizBank.javascript;

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
