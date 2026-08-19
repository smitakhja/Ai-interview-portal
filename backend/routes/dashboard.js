import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

// GET /api/dashboard
router.get("/", async (req, res) => {
  const userId = getUserId(req);

  const results = {
    userId,
    profile: null,
    progress: null,
    interviewCount: 0,
    bestInterviewScore: 0,
    recentInterviews: [],
    quizCount: 0,
    bestQuizScore: 0,
    recentQuizzes: [],
    aptitudeCount: 0,
    bestAptitudeScore: 0,
    recentAptitude: [],
    resumeCount: 0,
    bestResumeScore: 0,
    recentResumes: [],
    overallReadiness: 0,
    recentActivity: [],
  };

  try {
    if (!supabase) throw new Error("Supabase not configured");

    // Fetch all data in parallel
    const [profileRes, progressRes, interviewRes, quizRes, aptitudeRes, resumeRes] = await Promise.allSettled([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("progress").select("*").eq("user_id", userId).single(),
      supabase.from("interview_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabase.from("quiz_results").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabase.from("aptitude_results").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabase.from("resume_analyses").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    ]);

    // Profile
    if (profileRes.status === "fulfilled" && profileRes.value.data) {
      const p = profileRes.value.data;
      results.profile = {
        name: p.full_name || p.email || userId,
        email: p.email || "",
        targetRole: p.target_role || "",
        skills: p.skills || [],
        avatarColor: p.avatar_color || "#3457D5",
      };
    }

    // Progress
    if (progressRes.status === "fulfilled" && progressRes.value.data) {
      results.progress = progressRes.value.data;
      results.overallReadiness = progressRes.value.data.readiness || 0;
    }

    // Interviews
    if (interviewRes.status === "fulfilled" && interviewRes.value.data) {
      const docs = interviewRes.value.data;
      results.interviewCount = docs.length;
      results.bestInterviewScore = docs.reduce((max, d) => Math.max(max, d.average_score || 0), 0);
      results.recentInterviews = docs.slice(0, 3).map(d => ({
        id: d.id, role: d.role, score: d.average_score, verdict: d.verdict, date: d.created_at,
      }));
    }

    // Quizzes
    if (quizRes.status === "fulfilled" && quizRes.value.data) {
      const docs = quizRes.value.data;
      results.quizCount = docs.length;
      results.bestQuizScore = docs.reduce((max, d) => Math.max(max, d.score || 0), 0);
      results.recentQuizzes = docs.slice(0, 3).map(d => ({
        id: d.id, topic: d.topic, score: d.score, total: d.total, date: d.created_at,
      }));
    }

    // Aptitude
    if (aptitudeRes.status === "fulfilled" && aptitudeRes.value.data) {
      const docs = aptitudeRes.value.data;
      results.aptitudeCount = docs.length;
      results.bestAptitudeScore = docs.reduce((max, d) => Math.max(max, d.score || 0), 0);
      results.recentAptitude = docs.slice(0, 3).map(d => ({
        id: d.id, score: d.score, total: d.total, date: d.created_at,
      }));
    }

    // Resumes
    if (resumeRes.status === "fulfilled" && resumeRes.value.data) {
      const docs = resumeRes.value.data;
      results.resumeCount = docs.length;
      results.bestResumeScore = docs.reduce((max, d) => Math.max(max, d.score || 0), 0);
      results.recentResumes = docs.slice(0, 3).map(d => ({
        id: d.id, fileName: d.file_name, score: d.score, date: d.created_at,
      }));
    }

    // Merged activity feed
    const activity = [
      ...results.recentInterviews.map(i => ({ type: "interview", label: `Mock Interview (${i.role})`, score: i.score, date: i.date })),
      ...results.recentQuizzes.map(q => ({ type: "quiz", label: `${q.topic} Quiz`, score: q.score, date: q.date })),
      ...results.recentAptitude.map(a => ({ type: "aptitude", label: "Aptitude Test", score: a.score, date: a.date })),
      ...results.recentResumes.map(r => ({ type: "resume", label: `Resume: ${r.fileName}`, score: r.score, date: r.date })),
    ];
    activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    results.recentActivity = activity.slice(0, 8);

    // Recalculate readiness
    if (!results.overallReadiness) {
      const scores = [
        results.bestInterviewScore, results.bestQuizScore,
        results.bestAptitudeScore, results.bestResumeScore,
      ].filter(s => s > 0);
      results.overallReadiness = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    }

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.json({ success: true, data: results });
  }
});

export default router;
