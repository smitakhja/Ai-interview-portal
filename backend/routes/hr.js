import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { hrQuestions } from "../data/hrQuestions.js";
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

export default router;
