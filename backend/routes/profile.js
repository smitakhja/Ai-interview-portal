import { Router } from "express";
import { supabase } from "../supabaseClient.js";

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
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data && !error) {
      return res.json({
        name: data.full_name || data.email,
        email: data.email,
        targetRole: data.target_role || "Software Engineer",
        experience: data.experience || "1-3 years",
        skills: data.skills || ["JavaScript", "React", "Node.js", "SQL"],
        avatarColor: data.avatar_color || "#3457D5",
      });
    }
  } catch (err) {
    console.error("Supabase Error (profile GET):", err.message);
  }

  res.json(store.get(userId) || getDefault());
});

// PUT /api/profile
router.put("/", async (req, res) => {
  const userId = getUserId(req);
  const current = store.get(userId) || getDefault();
  const updated = { ...current, ...req.body };
  store.set(userId, updated);

  try {
    if (!supabase) throw new Error("Supabase not configured");

    const row = {
      user_id: userId,
      full_name: updated.name || "Unknown",
      email: updated.email || userId + "@example.com",
      target_role: updated.targetRole || "",
      experience: updated.experience || "",
      skills: updated.skills || [],
      avatar_color: updated.avatarColor || "#3457D5",
      updated_at: new Date().toISOString(),
    };

    await supabase.from("profiles").upsert(row, { onConflict: "user_id" });
  } catch (err) {
    console.error("Supabase Error (profile PUT):", err.message);
  }

  res.json({ success: true, profile: updated });
});

export default router;
