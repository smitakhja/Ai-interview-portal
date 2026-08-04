import { Router } from "express";
import pool from "../db.js";

const router = Router();
const store = new Map();

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

function getDefault() {
  return {
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    targetRole: "Software Engineer",
    experience: "1-3 years",
    skills: ["JavaScript", "React", "Node.js", "SQL"],
    avatarColor: "#3457D5",
  };
}

// GET /api/profile
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [userId + "@example.com"]);
    if (rows.length > 0) {
      const user = rows[0];
      return res.json({
        name: user.full_name,
        email: user.email,
        targetRole: "Software Engineer",
        experience: "1-3 years",
        skills: ["JavaScript", "React", "Node.js", "SQL"],
        avatarColor: "#3457D5",
      });
    }
  } catch (err) {
    console.error("DB Error (profile GET):", err.message);
  }
  
  // Fallback to memory store
  res.json(store.get(userId) || getDefault());
});

// PUT /api/profile
router.put("/", async (req, res) => {
  const userId = getUserId(req);
  const current = store.get(userId) || getDefault();
  const updated = { ...current, ...req.body };
  store.set(userId, updated);
  
  try {
    // Upsert logic for simple demo (assumes email is unique)
    const email = userId + "@example.com";
    const fullName = updated.name || "Unknown";
    await pool.query(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE full_name = ?",
      [fullName, email, "hashed_password_stub", fullName]
    );
  } catch (err) {
    console.error("DB Error (profile PUT):", err.message);
  }

  res.json({ success: true, profile: updated });
});

export default router;
