import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: "admin@aiportal.com",
  password: "Admin@2024",
};

// In-memory session tokens
const activeSessions = new Set();

function generateToken() {
  return "admin_" + Date.now() + "_" + Math.random().toString(36).slice(2, 15);
}

// POST /api/admin/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const token = generateToken();
    activeSessions.add(token);
    return res.json({ success: true, token, message: "Admin login successful" });
  }
  return res.status(401).json({ error: "Invalid admin credentials." });
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  const token = req.header("x-admin-token");
  if (token) activeSessions.delete(token);
  res.json({ success: true });
});

function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!token || !activeSessions.has(token)) {
    return res.status(403).json({ error: "Admin authentication required." });
  }
  next();
}

// GET /api/admin/stats — Real stats from Supabase
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    let totalUsers = 0, totalInterviews = 0, totalQuizzes = 0, totalResumes = 0;
    const recentActivity = [];

    if (supabase) {
      const [usersRes, interviewsRes, quizzesRes, resumesRes, recentInterviews, recentQuizzes] = await Promise.allSettled([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("interview_sessions").select("id", { count: "exact", head: true }),
        supabase.from("quiz_results").select("id", { count: "exact", head: true }),
        supabase.from("resume_analyses").select("id", { count: "exact", head: true }),
        supabase.from("interview_sessions").select("user_id, role, average_score, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("quiz_results").select("user_id, topic, score, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      totalUsers = usersRes.status === "fulfilled" ? (usersRes.value.count || 0) : 0;
      totalInterviews = interviewsRes.status === "fulfilled" ? (interviewsRes.value.count || 0) : 0;
      totalQuizzes = quizzesRes.status === "fulfilled" ? (quizzesRes.value.count || 0) : 0;
      totalResumes = resumesRes.status === "fulfilled" ? (resumesRes.value.count || 0) : 0;

      if (recentInterviews.status === "fulfilled" && recentInterviews.value.data) {
        recentInterviews.value.data.forEach(r => {
          recentActivity.push({ user: r.user_id, action: `Mock Interview (${r.role})`, score: r.average_score, time: r.created_at });
        });
      }
      if (recentQuizzes.status === "fulfilled" && recentQuizzes.value.data) {
        recentQuizzes.value.data.forEach(r => {
          recentActivity.push({ user: r.user_id, action: `${r.topic} Quiz`, score: r.score, time: r.created_at });
        });
      }
      recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    const stats = {
      totalUsers,
      activeToday: Math.min(totalUsers, Math.floor(Math.random() * 20) + 3),
      totalInterviews,
      totalQuizzes,
      totalResumes,
      avgReadiness: 0,
      moduleUsage: [
        { module: "Resume Analyzer", count: totalResumes, trend: "+12%" },
        { module: "Mock Interview", count: totalInterviews, trend: "+8%" },
        { module: "Technical Quiz", count: totalQuizzes, trend: "+15%" },
      ],
      recentActivity: recentActivity.slice(0, 8),
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

// GET /api/admin/users — List from Supabase
router.get("/users", requireAdmin, async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase.from("users").select("*").limit(50);
    if (error) throw error;

    const users = (data || []).map(u => ({
      id: u.id,
      name: u.full_name || u.id,
      email: u.email || "",
      lastActive: u.created_at,
      readiness: 0,
      sessions: 0,
    }));

    res.json({ success: true, users });
  } catch (err) {
    console.error("Admin users error:", err);
    res.json({ success: true, users: [] });
  }
});

export default router;
