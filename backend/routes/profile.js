import { Router } from "express";
import { db } from "../firebaseAdmin.js";

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
    const doc = await db.collection("profiles").doc(userId).get();
    if (doc.exists) {
      const user = doc.data();
      return res.json({
        name: user.full_name || user.name,
        email: user.email,
        targetRole: user.targetRole || "Software Engineer",
        experience: user.experience || "1-3 years",
        skills: user.skills || ["JavaScript", "React", "Node.js", "SQL"],
        avatarColor: user.avatarColor || "#3457D5",
      });
    }
  } catch (err) {
    console.error("Firestore Error (profile GET):", err.message);
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
    await db.collection("profiles").doc(userId).set({
      full_name: updated.name || "Unknown",
      email: updated.email || userId + "@example.com",
      targetRole: updated.targetRole || "",
      experience: updated.experience || "",
      skills: updated.skills || [],
      avatarColor: updated.avatarColor || "#3457D5",
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Firestore Error (profile PUT):", err.message);
  }

  res.json({ success: true, profile: updated });
});

export default router;
