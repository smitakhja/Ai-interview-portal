import { Router } from "express";
import { aptitudeBank, getAptitudeSet } from "../data/aptitudeQuestions.js";

const router = Router();

// GET /api/aptitude/questions?count=8
router.get("/questions", (req, res) => {
  const { count = 8 } = req.query;
  const questions = getAptitudeSet(Number(count)).map(({ answer, ...q }) => q);
  res.json({ questions });
});

// POST /api/aptitude/submit  { answers: [{ id, selected }] }
router.post("/submit", (req, res) => {
  const { answers = [] } = req.body;

  let correctCount = 0;
  const byCategory = {};
  const breakdown = answers.map(({ id, selected }) => {
    const q = aptitudeBank.find((item) => item.id === id);
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
