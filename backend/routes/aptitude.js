import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { aptitudeBank } from "../data/aptitudeQuestions.js";
import { nanoid } from "nanoid";

const router = Router();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

// GET /api/aptitude/questions?count=8
router.get("/questions", (req, res) => {
  const { count = 8 } = req.query;
  const pool = aptitudeBank || [];
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const questions = shuffled.slice(0, Number(count)).map(({ answer, ...q }) => q);
  res.json({ questions });
});

// POST /api/aptitude/submit  { answers: [{ id, selected }] }
router.post("/submit", async (req, res) => {
  const userId = getUserId(req);
  const { answers = [] } = req.body;
  const pool = aptitudeBank || [];

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
  const resultId = nanoid();

  try {
    if (supabase) {
      await supabase.from("aptitude_results").insert({
        id: resultId,
        user_id: userId,
        score,
        correct_count: correctCount,
        total: answers.length,
        by_category: byCategory,
        breakdown,
      });
    }
  } catch (err) {
    console.error("Supabase aptitude save error:", err.message);
  }

  res.json({ success: true, score, correctCount, total: answers.length, byCategory, breakdown, resultId });
});

// GET /api/aptitude/history
router.get("/history", async (req, res) => {
  const userId = getUserId(req);
  try {
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase
      .from("aptitude_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const history = (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      score: d.score,
      correctCount: d.correct_count,
      total: d.total,
      byCategory: d.by_category,
      breakdown: d.breakdown,
      createdAt: d.created_at,
    }));

    return res.json({ success: true, history });
  } catch (err) {
    console.error("Supabase aptitude history error:", err.message);
    res.json({ success: true, history: [] });
  }
});

export default router;
