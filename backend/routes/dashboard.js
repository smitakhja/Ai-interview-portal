import { Router } from "express";
import { db } from "../firebaseAdmin.js";

const router = Router();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

// GET /api/dashboard
// Returns aggregated stats for a user: progress, interview history, quiz results, resume analyses
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
    // Fetch all subcollections in parallel
    const [
      profileDoc,
      progressDoc,
      interviewSnap,
      quizSnap,
      aptitudeSnap,
      resumeSnap,
    ] = await Promise.allSettled([
      db.collection("profiles").doc(userId).get(),
      db.collection("progress").doc(userId).get(),
      db.collection("users").doc(userId).collection("interviewSessions")
        .orderBy("createdAt", "desc").limit(5).get(),
      db.collection("users").doc(userId).collection("quizResults")
        .orderBy("createdAt", "desc").limit(5).get(),
      db.collection("users").doc(userId).collection("aptitudeResults")
        .orderBy("createdAt", "desc").limit(5).get(),
      db.collection("users").doc(userId).collection("resumeAnalyses")
        .orderBy("createdAt", "desc").limit(5).get(),
    ]);

    // Profile
    if (profileDoc.status === "fulfilled" && profileDoc.value.exists) {
      const p = profileDoc.value.data();
      results.profile = {
        name: p.full_name || p.name || userId,
        email: p.email || "",
        targetRole: p.targetRole || "",
        skills: p.skills || [],
        avatarColor: p.avatarColor || "#3457D5",
      };
    }

    // Progress
    if (progressDoc.status === "fulfilled" && progressDoc.value.exists) {
      results.progress = progressDoc.value.data();
      results.overallReadiness = results.progress.readiness || 0;
    }

    // Interview sessions
    if (interviewSnap.status === "fulfilled") {
      const docs = interviewSnap.value.docs.map(d => d.data());
      results.interviewCount = docs.length;
      results.bestInterviewScore = docs.reduce((max, d) => Math.max(max, d.averageScore || 0), 0);
      results.recentInterviews = docs.slice(0, 3).map(d => ({
        id: d.id,
        role: d.role,
        score: d.averageScore,
        verdict: d.verdict,
        date: d.createdAt,
      }));
    }

    // Quiz results
    if (quizSnap.status === "fulfilled") {
      const docs = quizSnap.value.docs.map(d => d.data());
      results.quizCount = docs.length;
      results.bestQuizScore = docs.reduce((max, d) => Math.max(max, d.score || 0), 0);
      results.recentQuizzes = docs.slice(0, 3).map(d => ({
        id: d.id,
        topic: d.topic,
        score: d.score,
        total: d.total,
        date: d.createdAt,
      }));
    }

    // Aptitude results
    if (aptitudeSnap.status === "fulfilled") {
      const docs = aptitudeSnap.value.docs.map(d => d.data());
      results.aptitudeCount = docs.length;
      results.bestAptitudeScore = docs.reduce((max, d) => Math.max(max, d.score || 0), 0);
      results.recentAptitude = docs.slice(0, 3).map(d => ({
        id: d.id,
        score: d.score,
        total: d.total,
        date: d.createdAt,
      }));
    }

    // Resume analyses
    if (resumeSnap.status === "fulfilled") {
      const docs = resumeSnap.value.docs.map(d => d.data());
      results.resumeCount = docs.length;
      results.bestResumeScore = docs.reduce((max, d) => Math.max(max, d.score || 0), 0);
      results.recentResumes = docs.slice(0, 3).map(d => ({
        id: d.id,
        fileName: d.fileName,
        score: d.score,
        date: d.createdAt,
      }));
    }

    // Build merged recent activity feed
    const activity = [
      ...results.recentInterviews.map(i => ({ type: "interview", label: `Mock Interview (${i.role})`, score: i.score, date: i.date })),
      ...results.recentQuizzes.map(q => ({ type: "quiz", label: `${q.topic} Quiz`, score: q.score, date: q.date })),
      ...results.recentAptitude.map(a => ({ type: "aptitude", label: "Aptitude Test", score: a.score, date: a.date })),
      ...results.recentResumes.map(r => ({ type: "resume", label: `Resume: ${r.fileName}`, score: r.score, date: r.date })),
    ];
    activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    results.recentActivity = activity.slice(0, 8);

    // Recalculate readiness from actual scores if progress not set
    if (!results.overallReadiness) {
      const scores = [
        results.bestInterviewScore,
        results.bestQuizScore,
        results.bestAptitudeScore,
        results.bestResumeScore,
      ].filter(s => s > 0);
      results.overallReadiness = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    }

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard data." });
  }
});

export default router;
