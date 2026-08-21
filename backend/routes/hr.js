import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { hrQuestions } from "../data/hrQuestions.js";
import { hrMCQBank } from "../data/hrMCQQuestions.js";
import { scoreAnswer } from "../utils/analyzer.js";

const router = Router();

// GET /api/hr/questions?count=5
router.get("/questions", (_req, res) => {
  const { count = 5 } = _req.query;
  const pool = hrQuestions || [];
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

// ─── HR MCQ endpoints ────────────────────────────────────────────────────────

// GET /api/hr/mcq/questions?count=10
router.get("/mcq/questions", (req, res) => {
  const { count = 10 } = req.query;
  const pool = hrMCQBank || [];
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  // Strip the answer from what we send to the client
  const questions = shuffled.slice(0, Number(count)).map(({ answer, explanation, ...q }) => q);
  res.json({ questions });
});

// POST /api/hr/mcq/submit  { answers: [{ id, selected }] }
router.post("/mcq/submit", async (req, res) => {
  const { answers = [] } = req.body;
  const pool = hrMCQBank || [];

  let correctCount = 0;
  const byCategory = {};
  const breakdown = answers.map(({ id, selected }) => {
    const q = pool.find((item) => item.id === id);
    const isCorrect = q != null && q.answer === selected;
    if (isCorrect) correctCount++;
    if (q) {
      byCategory[q.category] = byCategory[q.category] || { correct: 0, total: 0 };
      byCategory[q.category].total++;
      if (isCorrect) byCategory[q.category].correct++;
    }
    return {
      id,
      correct: !!isCorrect,
      correctAnswer: q?.answer ?? null,
      explanation: q?.explanation ?? "",
      skipped: selected === null || selected === undefined,
    };
  });

  const total = answers.length;
  const score = Math.round((correctCount / Math.max(total, 1)) * 100);

  res.json({ success: true, score, correctCount, total, byCategory, breakdown });
});

export default router;
