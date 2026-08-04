import { Router } from "express";
import { getHrSet } from "../data/hrQuestions.js";
import { scoreAnswer } from "../utils/analyzer.js";

const router = Router();

// GET /api/hr/questions?count=5
router.get("/questions", (req, res) => {
  const { count = 5 } = req.query;
  res.json({ questions: getHrSet(Number(count)) });
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
