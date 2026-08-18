import { Router } from "express";

const router = Router();

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: "admin@aiportal.com",
  password: "Admin@2024",
};

// In-memory session tokens (simple approach)
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

  if (
    email === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  ) {
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

// Middleware for admin-only routes
function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!token || !activeSessions.has(token)) {
    return res.status(403).json({ error: "Admin authentication required." });
  }
  next();
}

// GET /api/admin/stats — Dashboard statistics
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    // Aggregate stats from in-memory or provide defaults
    const stats = {
      totalUsers: Math.floor(Math.random() * 50) + 10,
      activeToday: Math.floor(Math.random() * 20) + 3,
      totalInterviews: Math.floor(Math.random() * 200) + 50,
      totalQuizzes: Math.floor(Math.random() * 300) + 80,
      totalResumes: Math.floor(Math.random() * 100) + 20,
      avgReadiness: Math.floor(Math.random() * 30) + 45,
      moduleUsage: [
        { module: "Resume Analyzer", count: Math.floor(Math.random() * 80) + 20, trend: "+12%" },
        { module: "Mock Interview", count: Math.floor(Math.random() * 60) + 15, trend: "+8%" },
        { module: "Technical Quiz", count: Math.floor(Math.random() * 100) + 30, trend: "+15%" },
        { module: "Aptitude Test", count: Math.floor(Math.random() * 70) + 25, trend: "+5%" },
        { module: "HR Interview", count: Math.floor(Math.random() * 50) + 10, trend: "+10%" },
        { module: "Video Interview", count: Math.floor(Math.random() * 40) + 5, trend: "+20%" },
      ],
      recentActivity: [
        { user: "alice", action: "Completed Technical Quiz", score: 85, time: "2 min ago" },
        { user: "bob123", action: "Uploaded Resume", score: null, time: "5 min ago" },
        { user: "charlie", action: "Mock Interview Session", score: 72, time: "12 min ago" },
        { user: "diana", action: "HR Interview Practice", score: 90, time: "18 min ago" },
        { user: "eve_dev", action: "Aptitude Test", score: 68, time: "25 min ago" },
        { user: "frank", action: "Video Interview", score: 78, time: "30 min ago" },
        { user: "grace", action: "Completed Technical Quiz", score: 92, time: "45 min ago" },
        { user: "harry", action: "Uploaded Resume", score: null, time: "1 hr ago" },
      ],
      dailyStats: [
        { day: "Mon", users: 12, sessions: 34 },
        { day: "Tue", users: 18, sessions: 45 },
        { day: "Wed", users: 15, sessions: 38 },
        { day: "Thu", users: 22, sessions: 56 },
        { day: "Fri", users: 20, sessions: 52 },
        { day: "Sat", users: 8, sessions: 19 },
        { day: "Sun", users: 10, sessions: 24 },
      ],
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

// GET /api/admin/users — List of users
router.get("/users", requireAdmin, async (req, res) => {
  const users = [
    { id: "alice", name: "Alice Johnson", email: "alice@example.com", lastActive: "2 min ago", readiness: 78, sessions: 12 },
    { id: "bob123", name: "Bob Smith", email: "bob@example.com", lastActive: "5 min ago", readiness: 65, sessions: 8 },
    { id: "charlie", name: "Charlie Brown", email: "charlie@example.com", lastActive: "12 min ago", readiness: 82, sessions: 15 },
    { id: "diana", name: "Diana Prince", email: "diana@example.com", lastActive: "18 min ago", readiness: 91, sessions: 22 },
    { id: "eve_dev", name: "Eve Davis", email: "eve@example.com", lastActive: "25 min ago", readiness: 55, sessions: 6 },
    { id: "frank", name: "Frank Miller", email: "frank@example.com", lastActive: "30 min ago", readiness: 70, sessions: 10 },
    { id: "demo-user", name: "Demo User", email: "demo@example.com", lastActive: "1 hr ago", readiness: 42, sessions: 3 },
  ];
  res.json({ success: true, users });
});

export default router;
