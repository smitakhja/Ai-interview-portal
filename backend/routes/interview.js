import { Router } from "express";
import { getInterviewSet, interviewQuestions } from "../data/interviewQuestions.js";
import { scoreAnswer } from "../utils/analyzer.js";

const router = Router();

// GET /api/interview/roles
router.get("/roles", (_req, res) => {
  res.json({ roles: Object.keys(interviewQuestions) });
});

// GET /api/interview/questions?role=software-engineer&count=5
router.get("/questions", (req, res) => {
  const { role = "software-engineer", count = 5 } = req.query;
  res.json({ role, questions: getInterviewSet(role, Number(count)) });
});

// POST /api/interview/answer  { questionId, question, keywords, answer }
router.post("/answer", (req, res) => {
  const { question, keywords = [], answer = "" } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "question and answer are required." });
  }
  const result = scoreAnswer(answer, keywords);
  res.json({ success: true, question, ...result });
});

// POST /api/interview/finish  { results: [{score,...}] }
router.post("/finish", (req, res) => {
  const { results = [] } = req.body;
  const avg = results.length
    ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
    : 0;
  res.json({
    success: true,
    averageScore: avg,
    verdict:
      avg >= 80 ? "Interview ready!" : avg >= 55 ? "Good progress, keep practicing." : "Needs more preparation.",
  });
});

export default router;
