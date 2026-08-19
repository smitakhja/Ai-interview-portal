import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { userId, email, name } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    if (!supabase) throw new Error("Supabase not configured");

    // Check if user exists
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (existing) {
      return res.json({ success: true, message: "Login successful", user: existing });
    }

    // Create new user
    const user = {
      id: userId,
      email: email || userId,
      full_name: name || userId,
    };
    const { data, error } = await supabase.from("users").insert(user).select().single();
    if (error) throw error;

    res.json({ success: true, message: "Login successful", user: data });
  } catch (error) {
    console.error("Supabase Login Error:", error.message);
    res.json({ success: true, message: "Login successful (fallback)", userId });
  }
});

export default router;
