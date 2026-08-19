import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { quizBank } from "../data/quizQuestions.js";
import { nanoid } from "nanoid";

const router = Router();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

// GET /api/quiz/topics
router.get("/topics", (_req, res) => {
  res.json({ topics: Object.keys(quizBank) });
});

// GET /api/quiz/questions?topic=javascript&count=5
router.get("/questions", (req, res) => {
  const { topic = "javascript", count = 5 } = req.query;
  const pool = quizBank[topic] || quizBank.javascript || [];
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Number(count));
  const questions = selected.map(({ answer, explanation, ...q }) => q);
  res.json({ topic, questions });
});

// POST /api/quiz/submit  { topic, answers: [{ id, selected }] }
router.post("/submit", async (req, res) => {
  const userId = getUserId(req);
  const { topic = "javascript", answers = [] } = req.body;
  const pool = quizBank[topic] || quizBank.javascript || [];

  let correctCount = 0;
  const breakdown = answers.map(({ id, selected }) => {
    const q = pool.find(item => item.id === id);
    const isCorrect = q && q.answer === selected;
    if (isCorrect) correctCount++;
    return { id, correct: !!isCorrect, correctAnswer: q?.answer, explanation: q?.explanation };
  });

  const score = Math.round((correctCount / Math.max(answers.length, 1)) * 100);
  const resultId = nanoid();

  try {
    if (supabase) {
      await supabase.from("quiz_results").insert({
        id: resultId,
        user_id: userId,
        topic,
        score,
        correct_count: correctCount,
        total: answers.length,
        breakdown,
      });
    }
  } catch (err) {
    console.error("Supabase quiz save error:", err.message);
  }

  res.json({ success: true, score, correctCount, total: answers.length, breakdown, resultId });
});

// GET /api/quiz/history
router.get("/history", async (req, res) => {
  const userId = getUserId(req);
  try {
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const history = (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      topic: d.topic,
      score: d.score,
      correctCount: d.correct_count,
      total: d.total,
      breakdown: d.breakdown,
      createdAt: d.created_at,
    }));

    return res.json({ success: true, history });
  } catch (err) {
    console.error("Supabase quiz history error:", err.message);
    res.json({ success: true, history: [] });
  }
});

export default router;
